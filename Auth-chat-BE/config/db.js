const mongoose = require('mongoose');

// Fonction pour connecter à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,  // Timeout pour la connexion
      socketTimeoutMS: 45000,         // Timeout pour les opérations sur la base de données
    });
    console.log('MongoDB connecté');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);  // Quitte l'application si la connexion échoue
  }
};

module.exports = connectDB;
