import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './message.css';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const socket = io('http://localhost:5000'); // adapte si en production

function Message({ currentUser }) {
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);

  // ✅ Rendre fetchUsers mémorisée pour éviter l'avertissement ESLint
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setAllUsers(res.data.filter(user => user._id !== currentUser._id));
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
    }
  }, [currentUser._id]);

  useEffect(() => {
    fetchUsers(); // charger tous les utilisateurs

    socket.emit('userConnected', currentUser._id);
    socket.emit('join', currentUser._id);

    socket.on('onlineUsers', (users) => {
      const ids = users.map(u => u.id);
      setOnlineUserIds(ids);
    });

    socket.on('receiveMessage', (msg) => {
      if (msg.from === selectedUser?._id || msg.to === selectedUser?._id) {
        setConversation(prev => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser._id, selectedUser, fetchUsers]); // ✅ fetchUsers est bien listée

  const fetchMessages = async (userId) => {
    try {
      setSelectedUser(allUsers.find(u => u._id === userId));
      const res = await axios.get(`http://localhost:5000/api/messages/${currentUser._id}/${userId}`);
      setConversation(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des messages :", error);
    }
  };

  const sendMessage = async () => {
    if (message.trim() === '') return;

    const msgData = {
      from: currentUser._id,
      to: selectedUser._id,
      content: message
    };

    socket.emit('sendMessage', msgData);
    setConversation([...conversation, msgData]);
    setMessage('');
  };

  return (
    <div className="message-container">
      <div className="user-list">
        <h3>Utilisateurs</h3>
        <ul>
          {allUsers.map((user) => (
            <li key={user._id} onClick={() => fetchMessages(user._id)}>
              {user.nom}
              <span className="user-status">
                {onlineUserIds.includes(user._id) ? (
                  <i className="fas fa-circle" style={{ color: 'green' }}></i>
                ) : (
                  <i className="far fa-circle" style={{ color: 'gray' }}></i>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-section">
        <div className="message-box">
          {conversation.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                justifyContent: msg.from === currentUser._id ? 'flex-end' : 'flex-start',
                alignItems: 'center',
                marginBottom: '10px'
              }}
            >
              {msg.from !== currentUser._id && <FaUserCircle size={24} style={{ marginRight: '8px' }} />}
              <p className="message-bubble">{msg.content}</p>
              {msg.from === currentUser._id && <FaUserCircle size={24} style={{ marginLeft: '8px' }} />}
            </motion.div>
          ))}
        </div>
        <div className="input-area">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Écrire un message"
          />
          <button onClick={sendMessage}>
            <FaPaperPlane style={{ marginRight: "5px" }} />Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

export default Message;
