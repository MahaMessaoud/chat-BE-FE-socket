const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const userRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const Message = require("./models/Message");
const User = require("./models/User");
const authMiddleware = require("./middlewares/authMiddleware");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

let connectedUsers = {}; // Store connected users' socket IDs
let offlineMessages = {}; // Store unread messages for disconnected users

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes API
app.use("/api/auth", userRoutes);
app.use("/api/chat", chatRoutes);

// WebSocket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return next(new Error("Authentication error"));

    const user = await User.findById(decoded.id).select("username");
    if (!user) return next(new Error("User not found"));

    socket.user = { id: decoded.id, username: user.username };
    connectedUsers[user.username] = socket.id;
    io.emit("userStatusUpdate", Object.keys(connectedUsers)); // Send updated user list
    next();
  });
});
async function countUnreadMessages(userId) {
  const messages = await Message.find({ receiver: userId, read: false });
  const unreadCounts = {};

  messages.forEach((msg) => {
    unreadCounts[msg.sender] = (unreadCounts[msg.sender] || 0) + 1;
  });

  return unreadCounts;
}

async function getUsersWithUnread() {
  const users = await User.find().select("username unreadMessages");
  return users.map((user) => ({
    username: user.username,
    unread: Object.values(user.unreadMessages || {}).reduce(
      (acc, val) => acc + val,
      0
    ),
    online: Boolean(connectedUsers[user.username]),
  }));
}
// WebSocket Connection
io.on("connection", (socket) => {
  try {
    console.log(`🟢 User connected: ${socket.user.username}`);
    connectedUsers[socket.user.username] = socket.id;

    // Diffuse immédiatement la liste des utilisateurs connectés
    io.emit("userStatusUpdate", Object.keys(connectedUsers));

    // Envoi des messages non lus si disponibles
    if (offlineMessages[socket.user.username]) {
      socket.emit("newUnreadMessages", offlineMessages[socket.user.username]);
    }

    socket.on("sendMessage", async ({ receiver, message }) => {
      try {
        console.log("sendMessage");
        const receiverUser = await User.findOne({ username: receiver });
        console.log("receiverUser", receiverUser);
        if (!receiverUser) {
          return socket.emit("error", { message: "Receiver not found" });
        }

        // ✅ Créer un nouveau message avec `read: false`
        const newMessage = new Message({
          sender: socket.user.id,
          receiver: receiverUser._id,
          content: message,
          read: false,
        });
        await newMessage.save();

        // ✅ Incrémenter le nombre de messages non lus pour ce destinataire
        await User.findByIdAndUpdate(receiverUser._id, {
          $inc: { [`unreadMessages.${socket.user.id}`]: 1 },
        });

        // ✅ Si le destinataire est en ligne, envoie le message en temps réel
        if (connectedUsers[receiver]) {
          io.to(connectedUsers[receiver]).emit("newMessage", {
            sender: socket.user.username,
            message: message,
            createdAt: newMessage.createdAt,
          });

          // ✅ Mise à jour immédiate du badge rouge
          io.to(connectedUsers[receiver]).emit(
            "updateUnreadCount",
            await countUnreadMessages(receiverUser._id)
          );
        }

        // ✅ Mettre à jour la liste des messages non lus pour tous les utilisateurs
        io.emit("updateUnreadCount", await getUsersWithUnread());
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Error sending message" });
      }
    });

    socket.on("openChat", async ({ sender }) => {
      try {
        await User.findByIdAndUpdate(socket.user.id, {
          $set: {
            [`unreadMessages.${sender}`]: 0,
            [`openChats.${sender}`]: true,
          },
        });

        io.to(socket.id).emit(
          "updateUnreadCount",
          await getUsersWithUnread(socket.user.id)
        );
      } catch (error) {
        console.error("Error opening chat:", error);
      }
    });
    // ✅ Envoi d'un message dans le chat room (diffusé à tous les utilisateurs)

    socket.on("sendRoomMessage", async (messageData) => {
      try {
        // Trouver l'ID de l'utilisateur à partir de son nom d'utilisateur
        const senderUser = await User.findOne({ username: messageData.sender });
        if (!senderUser) {
          return socket.emit("error", { message: "Utilisateur non trouvé" });
        }
    
        const newMessage = new Message({
          sender: senderUser._id, 
          content: messageData.message,
          receiver: null,
          read: true, 
        });
    
        await newMessage.save();
    
        io.emit("newMessage", {
          sender: senderUser.username, 
          message: messageData.message,
          createdAt: newMessage.createdAt,
        });
    
        console.log(`Message envoyé à la chat room : ${messageData.message}`);
      } catch (error) {
        console.error("Erreur lors de l'envoi du message dans la room:", error);
        socket.emit("error", { message: "Erreur lors de l'envoi du message." });
      }
    });
    
    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.user.username}`);
      delete connectedUsers[socket.user.username];

      io.emit("userStatusUpdate", Object.keys(connectedUsers));
    });
  } catch (error) {
    console.error("Error in WebSocket connection:", error);
    socket.emit("error", { message: "Connection error" });
  }
});

app.get("/api/chat-room/messages", async (req, res) => {
  try {
    const messages = await Message.find({ receiver: null }) // Aucun destinataire spécifique
      .populate("sender", "username") // Ajouter le nom de l'expéditeur
      .sort({ createdAt: 1 }); // Tri par date de création

    res.json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Fetch messages between two users
app.get("/api/messages/:receiver", authMiddleware.protect, async (req, res) => {
  try {
    const receiverUsername = req.params.receiver;
    const receiver = await User.findOne({ username: receiverUsername });

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: receiver._id },
        { sender: receiver._id, receiver: req.user.id },
      ],
    })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch all messages
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find({})
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("username"); // Select only the username field
    res.json(users.map((user) => user.username)); // Return an array of usernames
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
});
// Fetch connected users
app.get("/api/connectedUsers", (req, res) => {
  res.json(Object.keys(connectedUsers));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
