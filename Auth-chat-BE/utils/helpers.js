const Message = require("../models/Message");

async function countUnreadMessages(userId) {
  const unreadCounts = await Message.aggregate([
    { $match: { receiver: userId, unreadMessages: true } },
    { $group: { _id: "$sender", count: { $sum: 1 } } },
  ]);

  return unreadCounts.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});
}

module.exports = { countUnreadMessages };
