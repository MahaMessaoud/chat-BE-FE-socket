const express = require("express");
const http = require("http");
const User = require("./models/User");
const Message = require("./models/Message"); // ✅ Importation du modèle Message
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const authMiddleware = require("./middlewares/authMiddleware"); // Importer le middleware pour l'authentification

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", // Assure-toi que l'URL de ton frontend est correcte
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
let connectedUsers = {}; // Object format: { username: socketId }

// Connexion MongoDB
connectDB();

// Routes API
app.use("/api/auth", userRoutes);
app.use("/api/chat", chatRoutes);

// Gestion des connexions WebSocket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return next(new Error("Authentication error"));

    const user = await User.findById(decoded.id).select("username");
    if (!user) return next(new Error("User not found"));

    // Ajoute l'utilisateur à la liste des connectés
    socket.user = { id: decoded.id, username: user.username };
    connectedUsers[user.username] = socket.id; // Enregistre le socketId de l'utilisateur
    next();
  });
});
// API pour récupérer les messages entre deux utilisateurs
app.get("/api/messages/:receiver", authMiddleware.protect, async (req, res) => {
  try {
    const receiverUsername = req.params.receiver;

    // Récupérer l'ID du destinataire à partir du nom d'utilisateur
    const receiver = await User.findOne({ username: receiverUsername });

    if (!receiver) {
      return res
        .status(404)
        .json({ error: "Utilisateur destinataire non trouvé" });
    }

    // Trouver les messages entre l'utilisateur connecté et le destinataire
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: receiver._id },
        { sender: receiver._id, receiver: req.user.id },
      ],
    })
      .populate("sender", "username") // Récupérer le nom d'utilisateur de l'expéditeur
      .sort({ createdAt: 1 }); // Trier par date de création

    res.json(messages); // Retourner les messages
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Connexion WebSocket// Connexion WebSocket
io.on("connection", (socket) => {
  console.log(`🟢 Utilisateur connecté: ${socket.user.username}`);

  // Lorsque l'utilisateur envoie un message
  socket.on("sendMessage", async ({ receiver, message }) => {
    try {
      // Récupérer l'ID du destinataire à partir du nom d'utilisateur
      const receiverUser = await User.findOne({ username: receiver });
      if (!receiverUser) {
        return socket.emit("error", {
          message: "Utilisateur destinataire non trouvé",
        });
      }

      // Créer un nouveau message
      const newMessage = new Message({
        sender: socket.user.id, // L'ID de l'expéditeur
        receiver: receiverUser._id, // L'ID du destinataire
        content: message, // Le contenu du message
      });

      // Sauvegarder le message dans la base de données
      await newMessage.save();

      // Envoi du message au destinataire en temps réel
      io.to(connectedUsers[receiver]).emit("newMessage", {
        sender: socket.user.username,
        message: message,
        createdAt: newMessage.createdAt,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      socket.emit("error", { message: "Erreur lors de l'envoi du message" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Utilisateur déconnecté: ${socket.user.username}`);
    delete connectedUsers[socket.user.username]; // Retirer l'utilisateur de la liste des connectés
  });
});

app.get("/api/connectedUsers", (req, res) => {
  // Renvoie la liste des utilisateurs actuellement connectés
  res.json(Object.keys(connectedUsers));
});

app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find({}) // Récupère tous les messages
      .populate("sender", "username") // Remplir l'expéditeur avec son nom d'utilisateur
      .sort({ createdAt: 1 }); // Tri des messages par date de création

    res.json(messages); // Envoie les messages au frontend
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Serveur sur http://localhost:${PORT}`)
);
