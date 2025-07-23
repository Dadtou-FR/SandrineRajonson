const mongoose = require('mongoose');

const commentaireSchema = new mongoose.Schema({
  auteur: { type: String, required: true },
  texte: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const reactionTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

const reactionSchema = new mongoose.Schema({
  type: { type: String, enum: reactionTypes },
  utilisateur: { type: String },
});

const postSchema = new mongoose.Schema({
  auteur: { type: String, required: true },
  photoAuteur: { type: String }, // ← ajouté ici
  contenu: { type: String, required: true },
  image: { type: String, default: '' },
  commentaires: [commentaireSchema],
  reactions: [reactionSchema],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
