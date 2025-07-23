// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🧠 Exemple : chaque utilisateur a une liste d'amis = tableau d'IDs d'autres utilisateurs
// Route GET /api/users/:id/friends
router.get('/:id/friends', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('amis', 'nom email photo');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json(user.amis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
