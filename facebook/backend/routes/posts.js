// backend/routes/posts.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const SmtpConfig = require('../models/SmtpConfig');

const router = express.Router();

// 📁 Configuration du stockage pour Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ✅ Créer une publication
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { auteur, contenu } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const post = new Post({ auteur, contenu, image });
    await post.save();
    res.status(201).json({ message: 'Publication créée', post });
  } catch (err) {
    console.error('❌ Erreur création post :', err);
    res.status(500).json({ error: 'Erreur lors de la création du post' });
  }
});


// ✅ Afficher toutes les publications
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des publications' });
  }
});

// ✅ Ajouter un commentaire
router.post('/:id/comment', async (req, res) => {
  const { auteur, texte } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post non trouvé' });

    post.commentaires.push({ auteur, texte });
    await post.save();
    res.json({ message: 'Commentaire ajouté', post });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l’ajout du commentaire' });
  }
});
// Réaction à un post
router.post('/:id/react', async (req, res) => {
  const { userId, emoji } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trouvé' });

    // Réaction unique par utilisateur
    if (!post.reactions) post.reactions = {};
    post.reactions[userId] = emoji;

    await post.save();
    res.json({ reactions: post.reactions });
  } catch (err) {
    console.error('Erreur réaction:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
