const Post = require('../models/Post');
const User = require('../models/User');

const createPost = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const newPost = new Post({
      auteur: user.nom,
      photoAuteur: user.photo, // ← c'est ici qu'on met la photo
      contenu: req.body.contenu,
      image: req.file ? '/uploads/posts/' + req.file.filename : ''
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Erreur lors de la création du post :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { createPost };
