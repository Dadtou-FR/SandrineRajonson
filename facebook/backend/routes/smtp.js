// backend/routes/smtp.js
const express = require('express');
const router = express.Router();
const SmtpConfig = require('../models/SmtpConfig');

// 📩 Enregistrer ou mettre à jour la config SMTP
router.post('/', async (req, res) => {
  const { host, port, secure, user, pass } = req.body;

  try {
    const existing = await SmtpConfig.findOne();
    if (existing) {
      existing.host = host;
      existing.port = port;
      existing.secure = secure;
      existing.user = user;
      existing.pass = pass;
      await existing.save();
      return res.json({ message: 'Configuration SMTP mise à jour avec succès.' });
    } else {
      const config = new SmtpConfig({ host, port, secure, user, pass });
      await config.save();
      return res.json({ message: 'Configuration SMTP enregistrée avec succès.' });
    }
  } catch (err) {
    console.error('Erreur sauvegarde SMTP :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 📥 Obtenir la config SMTP actuelle
router.get('/', async (req, res) => {
  try {
    const config = await SmtpConfig.findOne();
    if (!config) return res.status(404).json({ error: 'Aucune configuration SMTP trouvée' });
    res.json(config);
  } catch (err) {
    console.error('Erreur récupération SMTP :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
