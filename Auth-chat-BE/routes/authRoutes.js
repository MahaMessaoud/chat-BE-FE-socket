const express = require("express");
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware"); // Assure-toi du bon chemin

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

module.exports = router;
