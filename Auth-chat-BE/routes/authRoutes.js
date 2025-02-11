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
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("username");
    res.json(users.map((user) => user.username));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/connected", (req, res) => {
  res.json(Object.keys(connectedUsers));
});

module.exports = router;
