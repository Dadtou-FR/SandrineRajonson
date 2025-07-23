const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// 📁 Config de stockage pour photo de profil
const storage = multer.diskStorage({
  destination: './uploads/profile/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Enregistrement avec photo de profil
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { nom, email, password } = req.body;

    // Vérifie si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const photo = req.file ? `/uploads/profile/${req.file.filename}` : '';

    const user = new User({
      nom,
      email,
      password: hashedPassword,
      photo
    });

    await user.save();
    res.status(201).json({ message: "Inscription réussie", user });

  } catch (err) {
    console.error("❌ Erreur lors de l'inscription :", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});


// ✅ Route pour mettre à jour uniquement la photo de profil
router.post('/upload-photo/:id', upload.single('photo'), async (req, res) => {
  try {
    const userId = req.params.id;
    const photoPath = `/uploads/profile/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(userId, { photo: photoPath }, { new: true });
    res.json({ message: "Photo mise à jour", user });
  } catch (err) {
    console.error('Erreur upload photo:', err);
    res.status(500).json({ error: "Erreur upload photo" });
  }
});

// ✅ Nouvelle route : mise à jour nom/email
router.put('/update/:id', async (req, res) => {
  try {
    const { nom, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nom, email },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error("Erreur mise à jour profil :", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil" });
  }
});

module.exports = router;
