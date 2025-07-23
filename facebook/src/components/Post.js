// src/components/Post.js
import React, { useState } from 'react';
import axios from 'axios';

const emojis = [
  { label: '👍', name: 'like' },
  { label: '❤️', name: 'love' },
  { label: '😄', name: 'haha' },
  { label: '😢', name: 'sad' },
  { label: '😡', name: 'angry' },
];

const Post = ({ post, currentUserId, userNom, onCommentAdded }) => {
  const [commentaire, setCommentaire] = useState('');
  const [reactions, setReactions] = useState(post.reactions || {});
  const [commentaires, setCommentaires] = useState(post.commentaires || []);

  const handleReact = async (emojiName) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${post._id}/react`, {
        userId: currentUserId,
        emoji: emojiName,
      });
      setReactions(res.data.reactions);
    } catch (error) {
      console.error("Erreur réaction :", error);
    }
  };

  const handleAddComment = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${post._id}/comment`, {
        auteur: userNom,
        texte: commentaire,
      });
      setCommentaires([...commentaires, res.data.commentaire]);
      setCommentaire('');
      if (onCommentAdded) onCommentAdded(); // callback si parent veut recharger
    } catch (error) {
      console.error("Erreur ajout commentaire :", error);
    }
  };

  return (
    <div style={styles.post}>
      <div style={styles.postHeader}>
        <img
          src={`http://localhost:5000/uploads/profile/default.jpg`}
          alt="profil"
          style={styles.avatar}
        />
        <div>
          <strong>{post.auteur}</strong><br />
          <small>{new Date(post.date).toLocaleString()}</small>
        </div>
      </div>
      <p>{post.contenu}</p>
      {post.image && <img src={`http://localhost:5000${post.image}`} style={styles.image} alt="" />}

      <div style={{ marginTop: 10 }}>
        {emojis.map((emoji) => (
          <button
            key={emoji.name}
            onClick={() => handleReact(emoji.name)}
            style={{
              marginRight: 5,
              cursor: 'pointer',
              fontSize: 20,
              border: 'none',
              background: 'transparent',
            }}
            className={reactions[currentUserId] === emoji.name ? 'selected' : ''}
          >
            {emoji.label}
          </button>
        ))}
        {reactions[currentUserId] && (
          <p style={{ fontStyle: 'italic', fontSize: 14 }}>
            Réaction choisie : {emojis.find(e => e.name === reactions[currentUserId])?.label}
          </p>
        )}
      </div>

      {/* 💬 Commentaires */}
      <input
        type="text"
        placeholder="Commenter..."
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        style={styles.commentInput}
      />
      <button onClick={handleAddComment} style={styles.commentBtn}>Envoyer</button>

      {commentaires.map((c, i) => (
        <p key={i} style={{ fontStyle: 'italic', marginLeft: 10 }}>
          💬 <strong>{c.auteur}</strong>: {c.texte}
        </p>
      ))}
    </div>
  );
};

const styles = {
  post: {
    background: '#fff',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  },
  postHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' },
  image: { maxWidth: '100%', marginTop: 10 },
  commentInput: { width: '80%', padding: 5, marginTop: 10 },
  commentBtn: {
    marginLeft: 5,
    padding: '6px 10px',
    background: '#42b72a',
    color: '#fff',
    border: 'none',
    borderRadius: 5
  }
};

export default Post;
