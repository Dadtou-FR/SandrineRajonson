import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Dashboard.css'; // Importez le fichier CSS

const socket = io('http://localhost:5000');

const EMOJI_MAP = {
  like: '👍',
  love: '❤️',
  haha: '😄',
  wow: '😲',
  sad: '😢',
  angry: '😡',
};

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [contenu, setContenu] = useState('');
  const [image, setImage] = useState(null);
  const [commentaire, setCommentaire] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // États pour les stories
  const [stories, setStories] = useState([]);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyContenu, setStoryContenu] = useState('');
  const [storyImage, setStoryImage] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
    fetchStories(); // Charger les stories

    if (user?._id) {
      socket.emit('userConnected', user._id);
    }

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts');
      setPosts(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des publications :', error);
    }
  };

  // Fonction pour récupérer les stories
  const fetchStories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stories');
      setStories(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des stories :', error);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('auteur', user?.nom || 'Utilisateur');
    formData.append('contenu', contenu);
    if (image) formData.append('image', image);

    try {
      await axios.post('http://localhost:5000/api/posts', formData);
      setContenu('');
      setImage(null);
      fetchPosts();
    } catch (error) {
      console.error('Erreur lors de la création du post :', error);
    }
  };

  // Fonction pour créer une story
  const createStory = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('auteur', user?.nom || 'Utilisateur');
    formData.append('userId', user?._id);
    if (storyContenu) formData.append('contenu', storyContenu);
    if (storyImage) formData.append('media', storyImage);

    try {
      await axios.post('http://localhost:5000/api/stories', formData);
      setStoryContenu('');
      setStoryImage(null);
      setShowStoryModal(false);
      fetchStories();
    } catch (error) {
      console.error('Erreur lors de la création de la story :', error);
    }
  };

  const ajouterCommentaire = async (postId) => {
    try {
      await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, {
        auteur: user?.nom || 'Utilisateur',
        texte: commentaire[postId]
      });
      setCommentaire({ ...commentaire, [postId]: '' });
      fetchPosts();
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire :", error);
    }
  };

  const handleReaction = async (postId, emoji) => {
    try {
      await axios.post(`http://localhost:5000/api/posts/${postId}/react`, {
        userId: user?._id,
        emoji
      });
      fetchPosts(); // Refresh after reaction
    } catch (error) {
      console.error("Erreur réaction :", error);
    }
  };

  const getUserReaction = (reactions) => {
    const reaction = reactions.find(r => r.utilisateur === user?._id);
    return reaction?.type || null;
  };

  const getReactionCount = (reactions, type) =>
    reactions.filter(r => r.type === type).length;

  // Fonction pour ouvrir le visualiseur de story
  const openStoryViewer = (userStories, storyIndex = 0) => {
    setSelectedStory(userStories);
    setCurrentStoryIndex(storyIndex);
    setShowStoryViewer(true);
  };

  // Fonction pour naviguer entre les stories
  const nextStory = () => {
    if (selectedStory && currentStoryIndex < selectedStory.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setShowStoryViewer(false);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  // Regrouper les stories par utilisateur
  const groupedStories = stories.reduce((acc, story) => {
    const existing = acc.find(group => group.userId === story.userId);
    if (existing) {
      existing.stories.push(story);
    } else {
      acc.push({
        userId: story.userId,
        auteur: story.auteur,
        stories: [story]
      });
    }
    return acc;
  }, []);

  return (
    <div className="container">
      {/* Utilisateurs en ligne */}
      <div className="online-users">
        <h3>🟢 Utilisateurs en ligne</h3>
        <ul>
          {onlineUsers.map((u) => (
            <li key={u.id}>👤 {u.nom}</li>
          ))}
        </ul>
      </div>

      {/* Section Stories */}
      <div className="stories-section">
        <h3>📖 Stories</h3>
        <div className="stories-container">
          {/* Bouton pour créer une story */}
          <div className="story-item create-story" onClick={() => setShowStoryModal(true)}>
            <div className="story-avatar">
              <img
                src={`http://localhost:5000${user?.photo || '/uploads/profile/default.jpg'}`}
                alt="Votre profil"
              />
              <div className="add-story-icon">+</div>
            </div>
            <span>Votre story</span>
          </div>

          {/* Affichage des stories existantes */}
          {groupedStories.map((userStories, index) => (
            <div 
              key={userStories.userId} 
              className="story-item"
              onClick={() => openStoryViewer(userStories, 0)}
            >
              <div className="story-avatar">
                <img
                  src={`http://localhost:5000${user?.photo || '/uploads/profile/default.jpg'}`}
                  alt={userStories.auteur}
                />
                <div className="story-ring"></div>
              </div>
              <span>{userStories.auteur}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal pour créer une story */}
      {showStoryModal && (
        <div className="modal-overlay" onClick={() => setShowStoryModal(false)}>
          <div className="story-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Créer une story</h3>
              <button onClick={() => setShowStoryModal(false)}>✕</button>
            </div>
            <form onSubmit={createStory} className="story-form">
              <textarea
                placeholder="Quoi de neuf ?"
                value={storyContenu}
                onChange={(e) => setStoryContenu(e.target.value)}
                className="story-textarea"
              />
              <input 
                type="file" 
                accept="image/*,video/*"
                onChange={(e) => setStoryImage(e.target.files[0])} 
                className="story-file-input"
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowStoryModal(false)}>Annuler</button>
                <button type="submit" disabled={!storyImage} className={!storyImage ? 'disabled-button' : ''}> Publier la story </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visualiseur de story */}
      {showStoryViewer && selectedStory && (
        <div className="story-viewer-overlay" onClick={() => setShowStoryViewer(false)}>
          <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="story-header">
              <div className="story-progress">
                {selectedStory.stories.map((_, index) => (
                  <div 
                    key={index}
                    className={`progress-bar ${index <= currentStoryIndex ? 'active' : ''}`}
                  ></div>
                ))}
              </div>
              <div className="story-info">
                <img
                  src={`http://localhost:5000${user?.photo || '/uploads/profile/default.jpg'}`}
                  alt={selectedStory.auteur}
                />
                <span>{selectedStory.auteur}</span>
                <small>{new Date(selectedStory.stories[currentStoryIndex]?.date).toLocaleString()}</small>
              </div>
              <button onClick={() => setShowStoryViewer(false)}>✕</button>
            </div>
            
            <div className="story-content" onClick={nextStory}>
              {selectedStory.stories[currentStoryIndex]?.image && (
                <img 
                  src={`http://localhost:5000${selectedStory.stories[currentStoryIndex].image}`}
                  alt="Story"
                />
              )}
              {selectedStory.stories[currentStoryIndex]?.contenu && (
                <p>{selectedStory.stories[currentStoryIndex].contenu}</p>
              )}
            </div>

            <div className="story-navigation">
              <button onClick={prevStory} disabled={currentStoryIndex === 0}>
                ←
              </button>
              <button onClick={nextStory}>
                →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de post (inchangé) */}
      <form onSubmit={createPost} className="form">
        <h2>Créer une publication</h2>
        <textarea
          placeholder="Que voulez-vous partager ?"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          className="textarea"
          required
        />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit" className="button">Publier</button>
      </form>

      {/* Affichage des posts (inchangé) */}
      {posts.map((post) => {
        const userReaction = getUserReaction(post.reactions || []);
        return (
          <div key={post._id} className="post">
            <div className="postHeader">
              <img
                src={`http://localhost:5000${user?.photo || '/uploads/profile/default.jpg'}`}
                alt="profil"
                className="avatar"
              />
              <div>
                <strong>{post.auteur}</strong><br />
                <small>{new Date(post.date).toLocaleString()}</small>
              </div>
            </div>

            <p>{post.contenu}</p>
            {post.image && <img src={`http://localhost:5000${post.image}`} className="image" alt="" />}

            {/* Section des réactions */}
            <div className="reactions-section">
              <div className="reactions-buttons">
                {Object.entries(EMOJI_MAP).map(([type, emoji]) => (
                  <button
                    key={type}
                    onClick={() => handleReaction(post._id, type)}
                    className={`reaction-btn ${userReaction === type ? 'active' : ''}`}
                  >
                    <span>{emoji}</span>
                    {getReactionCount(post.reactions || [], type) > 0 && (
                      <span className="reaction-count">
                        {getReactionCount(post.reactions, type)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {userReaction && (
                <div className="user-reaction">
                  Votre réaction : {EMOJI_MAP[userReaction]}
                </div>
              )}
            </div>

            {/* Section des commentaires */}
            <div className="comments-section">
              <div className="comment-input-container">
                <input
                  type="text"
                  placeholder="Écrivez un commentaire..."
                  value={commentaire[post._id] || ''}
                  onChange={(e) => setCommentaire({ ...commentaire, [post._id]: e.target.value })}
                  className="commentInput"
                />
                <button onClick={() => ajouterCommentaire(post._id)} className="commentBtn">
                  Envoyer
                </button>
              </div>
              
              {post.commentaires.map((c, i) => (
                <div key={i} className="comment">
                  <strong>{c.auteur}</strong>
                  <span className="comment-text">{c.texte}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Dashboard;