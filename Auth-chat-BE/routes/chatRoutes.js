const express = require("express");
const { getMessages } = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware.protect, getMessages);

module.exports = router;
