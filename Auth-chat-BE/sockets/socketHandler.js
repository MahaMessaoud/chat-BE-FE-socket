const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const { countUnreadMessages } = require("../utils/helpers");

let connectedUsers = {}; // Stockage des utilisateurs connectés

module.exports = (io) => {
  // Middleware WebSocket pour l'authentification
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("username");

      if (!user) return next(new Error("User not found"));

      socket.user = { id: user._id, username: user.username };
      connectedUsers[user.username] = socket.id;
      io.emit("userStatusUpdate", Object.keys(connectedUsers)); // Met à jour la liste des utilisateurs
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.user.username}`);

    socket.on("sendMessage", async ({ receiver, message }) => {
      try {
        const receiverUser = await User.findOne({ username: receiver });
        if (!receiverUser) return socket.emit("error", { message: "Receiver not found" });

        const newMessage = new Message({
          sender: socket.user.id,
          receiver: receiverUser._id,
          content: message,
          unreadMessages: true,
        });

        await newMessage.save();

        if (connectedUsers[receiver]) {
          io.to(connectedUsers[receiver]).emit("newMessage", {
            sender: socket.user.username,
            message: message,
            createdAt: newMessage.createdAt,
          });

          io.to(connectedUsers[receiver]).emit("updateUnreadCount", await countUnreadMessages(receiverUser._id));
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Error sending message" });
      }
    });

    socket.on("openChat", async ({ sender }) => {
      try {
        await Message.updateMany(
          { sender, receiver: socket.user.id, unreadMessages: true },
          { $set: { unreadMessages: false } }
        );

        io.to(socket.id).emit("updateUnreadCount", await countUnreadMessages(socket.user.id));
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.user.username}`);
      delete connectedUsers[socket.user.username];
      io.emit("userStatusUpdate", Object.keys(connectedUsers));
    });
  });
};
