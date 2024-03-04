require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "https://test-build-from0.vercel.app",
        credentials: true
    }
});

const connectedUsers = {};

io.on('connection', (socket) => {

    socket.on('login', async (username) => {
        connectedUsers[socket.id] = username;
        io.emit('userStatus', { username, online: true });
        const onlineUserCount = Object.keys(connectedUsers).length;
        io.emit('updateUserCount', onlineUserCount);
    });

    socket.on('chat', (data) => {
        io.emit('chat', { message: data.message, username: data.username });
    });

    socket.on('username', (username) => {
        connectedUsers[socket.id] = username;
    })

    socket.on('disconnect', () => {
        const username = connectedUsers[socket.id];
        io.emit('userStatus', { username, online: false });

        delete connectedUsers[socket.id];
        const onlineUserCount = Object.keys(connectedUsers).length;
        io.emit('updateUserCount', onlineUserCount);
    })

    socket.on('error', (error) => {
        console.error('Socket.IO Error:', error);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Socket.IO server listening on port ${PORT}`);
});
