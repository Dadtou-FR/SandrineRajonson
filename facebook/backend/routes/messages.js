// routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Enregistrer un message
router.post('/', async (req, res) => {
  try {
    const { from, to, content } = req.body;
    const newMessage = new Message({ from, to, content });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l’enregistrement du message' });
  }
});

// Récupérer les messages par ID de conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
