const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

// Gestion des connexions
let users = [];

io.on('connection', (socket) => {
  console.log('🔌 Un utilisateur connecté');

  socket.on('join', (userId) => {
    socket.userId = userId;
    if (!users.includes(userId)) users.push(userId);
    io.emit('onlineUsers', users);
  });

  socket.on('sendMessage', ({ from, to, message }) => {
    io.emit('receiveMessage', { from, to, message });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Utilisateur déconnecté');
    users = users.filter(id => id !== socket.userId);
    io.emit('onlineUsers', users);
  });
});

server.listen(5000, () => {
  console.log('✅ Serveur Socket.io démarré sur le port 5000');
});
