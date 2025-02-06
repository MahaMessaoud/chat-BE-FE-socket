const Message = require("../models/Message");


exports.sendMessage = async (req, res) => {
    const { message } = req.body; // Récupère le message du corps de la requête
  
    const newMessage = new Message({
      sender: req.user.id, // Récupère l'ID de l'utilisateur connecté
      content: message,
    });
  
    try {
      // Enregistre dans MongoDB
      await newMessage.save();
  
      // Récupérer les informations de l'expéditeur et renvoyer la réponse
      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username');
  
      res.status(201).json({
        sender: populatedMessage.sender.username, // Renvoie le nom de l'expéditeur
        content: populatedMessage.content, // Le contenu du message
        createdAt: populatedMessage.createdAt, // La date du message
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'envoi du message" });
    }
  };
  

// chatController.js

// exports.getMessages = async (req, res) => {
//   try {
//     const messages = await Message.find({}) // Récupérer tous les messages
//       .populate("sender") // Remplir le sender avec le username
//       .sort({ createdAt: 1 }); // Trier les messages par date de création

//     // Envoyer les messages au client
//     res.json(messages);
//   } catch (error) {
//     console.error("Erreur lors de la récupération des messages", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};