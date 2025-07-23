import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ nom: '', email: '', password: '' });
  const [photo, setPhoto] = useState(null);
  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErreur(''); // Réinitialise l'erreur avant chaque tentative

    const formData = new FormData();
    formData.append('nom', form.nom);
    formData.append('email', form.email);
    formData.append('password', form.password);
    if (photo) formData.append('photo', photo);

    try {
      const res = await axios.post('http://localhost:5000/api/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert("Inscription réussie !");
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setErreur(err.response.data.error); // message précis du backend
      } else {
        setErreur("Erreur à l'inscription.");
      }
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm("Souhaitez-vous vraiment quitter cette page ?");
    if (confirmCancel) navigate('/');
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleRegister} style={styles.form} encType="multipart/form-data">
        <h2>Inscription</h2>
        {erreur && <p style={styles.erreur}>{erreur}</p>}

        <input
          type="text"
          placeholder="Nom complet"
          style={styles.input}
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          style={styles.input}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          type="file"
          accept="image/*"
          style={styles.input}
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <button type="submit" style={styles.button}>S'inscrire</button>
        <button
          type="button"
          onClick={handleCancel}
          style={{ ...styles.button, backgroundColor: '#ccc', color: '#333', marginTop: 10 }}
        >
          Annuler
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: 30,
    borderRadius: 8,
    border: '1px solid #ccc',
    width: 300,
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    alignItems: 'center'
  },
  input: {
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
    width: '100%',
    borderRadius: 4,
    border: '1px solid #ccc'
  },
  button: {
    padding: 10,
    backgroundColor: '#42b72a',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    borderRadius: 4
  },
  erreur: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center'
  }
};

export default Register;
