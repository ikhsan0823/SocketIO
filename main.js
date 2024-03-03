require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { Users } = require('./models/users.js');
const { connect } = require('http2');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:2002",
        credentials: true
    }
});

const connectedUsers = {};

io.on('connection', (socket) => {

    socket.on('login', async (username) => {
        io.emit('userStatus', { username, online: true });
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
        updateUserStatusOnDisconnect(username);
    })

    socket.on('error', (error) => {
        console.error('Socket.IO Error:', error);
    });
});

async function updateUserStatusOnDisconnect(username) {
    try {
        const response = await fetch('http://localhost:2002/updateUserStatus', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, online: false })
        });

        const data = await response.json()
    } catch (error) {
        console.log(error);
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Socket.IO server listening on port ${PORT}`);
});
