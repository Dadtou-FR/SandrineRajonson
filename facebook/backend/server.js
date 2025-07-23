const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const smtpRoutes = require('./routes/smtp');
const User = require('./models/User');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 🔧 Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/smtp-config', smtpRoutes);

// ✅ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fecebook', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

// 🔴🟢 Utilisateurs connectés
const onlineUsers = new Map();

// ✅ Fonction pour renvoyer la liste complète des utilisateurs connectés
const getOnlineUsersWithNames = async () => {
  const onlineList = [];
  for (const [id] of onlineUsers.entries()) {
    const user = await User.findById(id).select('nom');
    if (user) onlineList.push({ id, nom: user.nom });
  }
  return onlineList;
};

// 🔄 Connexion Socket.IO
io.on('connection', (socket) => {
  console.log('🟢 Socket connecté');

  socket.on('userConnected', async (userId) => {
    try {
      const user = await User.findById(userId).select('nom');
      if (user) {
        onlineUsers.set(userId, socket.id);
        console.log(`👤 ${user.nom} est en ligne`);

        const onlineList = await getOnlineUsersWithNames();
        io.emit('onlineUsers', onlineList);
      }
    } catch (err) {
      console.error('❌ Erreur userConnected :', err);
    }
  });

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 ${userId} a rejoint sa room`);
  });

  socket.on('sendMessage', async (msg) => {
  try {
    const newMsg = new Message({
      from: msg.from,
      to: msg.to,
      content: msg.content
    });

    await newMsg.save(); // Stocker le message

    io.to(msg.to).emit('receiveMessage', msg); // Envoyer au destinataire
  } catch (err) {
    console.error('❌ Erreur lors de l’envoi du message :', err);
  }
});

 socket.on('disconnect', async () => {
  console.log('🔴 Socket déconnecté');

  for (let [userId, socketId] of onlineUsers.entries()) {
    if (socketId === socket.id) {
      onlineUsers.delete(userId);
      break;
    }
  }

  const onlineList = await getOnlineUsersWithNames();
  io.emit('onlineUsers', onlineList);
   });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // récupérer tous les utilisateurs
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur lors de la récupération des utilisateurs." });
  }
});

// 🚀 Lancer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend démarré sur http://localhost:${PORT}`);
 
});