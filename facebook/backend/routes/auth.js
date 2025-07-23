const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const SmtpConfig = require('../models/SmtpConfig');


// ✅ Configuration de multer pour la photo de profil
const storage = multer.diskStorage({
  destination: './uploads/profile/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 🔐 Connexion (login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Adresse e-mail non trouvée." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Mot de passe incorrect." });

    res.json({ message: "Connexion réussie", user });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
});


/* 🔐 INSCRIPTION */
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { nom, email, password } = req.body;
    const photo = req.file ? `/uploads/profile/${req.file.filename}` : '';

    const user = new User({
      nom,
      email,
      password, // le hash est fait automatiquement dans User.js
      photo
    });

    await user.save();

    res.status(201).json({ message: "Inscription réussie", user });
  } catch (err) {
    console.error("❌ Erreur à l'inscription :", err);
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ error: "Email déjà utilisé." });
    }
    res.status(500).json({ error: "Erreur serveur à l'inscription." });
  }
});

/* 🔑 RÉCUPÉRATION DE MOT DE PASSE */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    // 2. Générer un code sécurisé
    const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // ex : A3F6C2

    // 3. Enregistrer le code dans la base
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // 4. Charger la config SMTP depuis la base
    const config = await SmtpConfig.findOne();
    if (!config) return res.status(500).json({ error: "Configuration SMTP manquante." });

    // 5. Créer le transporteur
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      }
    });

    // 6. Définir le contenu du mail
    const mailOptions = {
      from: config.user,
      to: user.email,
      subject: 'Code de réinitialisation du mot de passe',
      text: `Bonjour ${user.nom},\n\nVotre code de réinitialisation est : ${code}.\nCe code expire dans 15 minutes.\n\nCordialement,\nL'équipe Support.`
    };

    // 7. Envoyer le mail
    await transporter.sendMail(mailOptions);

    res.json({ message: "Code envoyé à l'adresse e-mail fournie." });

  } catch (err) {
    console.error("Erreur envoi mail:", err);
    res.status(500).json({ error: 'Erreur serveur lors de la demande de réinitialisation.' });
  }
});
router.post('/verify-reset-code', async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.resetCode !== code) {
      return res.status(400).json({ error: 'Code invalide ou utilisateur introuvable.' });
    }

    if (user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ error: 'Code expiré.' });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Réinitialiser le code de sécurité
    user.resetCode = null;
    user.resetCodeExpires = null;

    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });

  } catch (err) {
    console.error('Erreur lors de la vérification du code :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ error: 'Code de réinitialisation invalide' });
    }

    if (user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ error: 'Code expiré. Veuillez en demander un nouveau.' });
    }

    // Met à jour le mot de passe
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    console.error('Erreur reset-password:', err);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
  }
});

// POST /api/smtp-config
router.post('/smtp-config', async (req, res) => {
  try {
    const { host, port, secure, user, pass } = req.body;
    await SmtpConfig.deleteMany(); // facultatif, pour n’avoir qu’une seule config
    const config = new SmtpConfig({ host, port, secure, user, pass });
    await config.save();
    res.json({ message: 'Configuration SMTP enregistrée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur d'enregistrement SMTP." });
  }
});

module.exports = router;
