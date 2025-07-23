import React, { useState } from 'react';
import axios from 'axios';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErreur('');

    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', {
        email,
        code,
        newPassword
      });

      setMessage(res.data.message || 'Mot de passe réinitialisé avec succès.');
      setEmail('');
      setCode('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setErreur(err.response?.data?.error || "Erreur lors de la réinitialisation.");
    }
  };

  return (
    <div className="login-container">
      <div className="right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center' }}>Réinitialiser le mot de passe</h2>

          {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
          {erreur && <p className="error">{erreur}</p>}

          <input
            type="email"
            placeholder="Votre adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Code de sécurité reçu"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit">Réinitialiser le mot de passe</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
