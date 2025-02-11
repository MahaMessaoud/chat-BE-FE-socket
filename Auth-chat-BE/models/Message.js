// const mongoose = require("mongoose");

// const MessageSchema = new mongoose.Schema({
//   sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   receiver: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   content: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
//   unreadMessages: { type: Boolean, default: true }, // ✅ Correction : Boolean avec default false
// });

// const Message = mongoose.model("Message", MessageSchema);
// module.exports = Message;
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }, // ✅ Correction : Indiquer si le message a été lu
});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
