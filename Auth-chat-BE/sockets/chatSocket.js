const Message = require('../models/Message');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🟢 User connected');

        socket.on('sendMessage', async ({ sender, content }) => {
            const message = await Message.create({ sender, content });
            io.emit('newMessage', message);
        });

        socket.on('disconnect', () => {
            console.log('🔴 User disconnected');
        });
    });
};
