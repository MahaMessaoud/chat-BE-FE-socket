const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];  // Récupère le token du header Authorization

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Vérifie le token
      req.user = await User.findById(decoded.id).select("username");  // Associe l'utilisateur connecté à la requête
      if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non trouvé" });
      }
      next();  // Passe au middleware suivant
    } catch (error) {
      return res.status(401).json({ error: "Token invalide" });
    }
  } else {
    return res.status(401).json({ error: "Token manquant" });
  }
};

module.exports = { protect };
