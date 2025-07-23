import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErreur('');

    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });

      if (res.data?.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        alert(res.data.message || 'Connexion réussie');
        navigate('/dashboard');
      } else {
        setErreur('Identifiants invalides');
      }
    } catch (err) {
      console.error(err);
      setErreur(
        err.response?.data?.error || 'Erreur de connexion au serveur'
      );
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="left">
        <h1 className="logo">Dadtoubooka</h1>
        <p>
          Avec Dadtoubooka, partagez et restez en contact avec votre entourage.
        </p>
      </div>

      <div className="right">
        <form className="login-form" onSubmit={handleLogin}>
          <h2 style={{ textAlign: 'center' }}>Connexion</h2>

          {erreur && <p className="error">{erreur}</p>}

          <input
            type="email"
            placeholder="Adresse e-mail ou numéro de tél."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Se connecter</button>
          <p className="forgot-password">
            <a href="/forgot-password">Mot de passe oublié ?</a>
          </p>

          <button
            type="button"
            className="create-btn"
            onClick={goToRegister}
          >
            Créer un nouveau compte
          </button>

          <p className="page-link">
            <a href="/register">Créer une Page</a> pour une célébrité, une
            marque ou une entreprise.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
