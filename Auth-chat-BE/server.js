

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
    next();
  });
});

// WebSocket Connection

io.on("connection", (socket) => {
  console.log(`🟢 User connected: ${socket.user.username}`);

  // Send message to the receiver and save it in DB
  socket.on("sendMessage", async ({ receiver, message }) => {
    try {
      const receiverUser = await User.findOne({ username: receiver });
      if (!receiverUser) {
        return socket.emit("error", { message: "Receiver not found" });
      }

      const newMessage = new Message({
        sender: socket.user.id,
        receiver: receiverUser._id,
        content: message,
      });

      await newMessage.save();

      
io.to(connectedUsers[receiver]).emit("newMessage", {
  sender: socket.user.username,
  message: message,
  createdAt: newMessage.createdAt,
});

socket.emit("newMessage", {
  sender: socket.user.username,
  message: message,
  createdAt: newMessage.createdAt,
});

    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Error sending message" });
    }
  });

  // On disconnect, remove user from connected users list
  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.user.username}`);
    delete connectedUsers[socket.user.username];
  });
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

// Fetch connected users
app.get("/api/connectedUsers", (req, res) => {
  res.json(Object.keys(connectedUsers));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
