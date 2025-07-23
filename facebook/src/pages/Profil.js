// src/pages/Profil.js
import React, { useState } from 'react';
import axios from 'axios';

function Profil() {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');

  const handleUpdatePhoto = async () => {
    if (!photo) return;

    const formData = new FormData();
    formData.append('photo', photo);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/upload-photo/${storedUser._id}`,
        formData
      );
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setMessage('✅ Photo mise à jour !');
    } catch (err) {
      console.error('Erreur maj photo :', err);
      setMessage('❌ Erreur mise à jour photo');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Mon Profil</h2>

      <img
        src={`http://localhost:5000${storedUser?.photo || '/uploads/profile/default.jpg'}`}
        alt="profil"
        style={styles.avatar}
      />

      <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
      <button onClick={handleUpdatePhoto} style={styles.button}>
        Mettre à jour la photo
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

const styles = {
  container: { padding: 20, fontFamily: 'Arial' },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: 10
  },
  button: {
    backgroundColor: '#1877f2',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 5,
    cursor: 'pointer',
    marginTop: 10
  }
};

export default Profil;
