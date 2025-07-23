import React, { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErreur('');

    try {
      const res = await axios.post('http://localhost:5000/api/forgot-password', { email });
      setMessage(res.data.message || 'Un lien de réinitialisation a été envoyé.');
    } catch (err) {
      console.error(err);
      setErreur(err.response?.data?.error || "Erreur lors de l'envoi de l'e-mail.");
    }
  };

  return (
    <div className="login-container">
      <div className="right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center' }}>Mot de passe oublié</h2>
          <p style={{ fontSize: 14, marginBottom: 10 }}>
            Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </p>

          {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
          {erreur && <p className="error">{erreur}</p>}

          <input
            type="email"
            placeholder="Votre adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Envoyer le lien</button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
