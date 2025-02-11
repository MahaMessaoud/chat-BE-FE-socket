// const express = require("express");
// const { getMessages } = require("../controllers/chatController");
// const authMiddleware = require("../middlewares/authMiddleware");

// const router = express.Router();

// router.get("/", authMiddleware.protect, getMessages);

// module.exports = router;
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Message = require("../models/Message");
const User = require("../models/User");

const router = express.Router();

router.get("/:receiver", authMiddleware.protect, async (req, res) => {
  try {
    const receiverUsername = req.params.receiver;
    const receiver = await User.findOne({ username: receiverUsername });

    if (!receiver) return res.status(404).json({ error: "Receiver not found" });

    const messages = await Message.find({
      $or: [{ sender: req.user.id, receiver: receiver._id }, { sender: receiver._id, receiver: req.user.id }],
    })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
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

module.exports = router;
