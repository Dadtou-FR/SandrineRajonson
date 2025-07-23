// src/components/SmtpForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SmtpForm() {
  const [config, setConfig] = useState({
    host: '',
    port: '',
    secure: false,
    user: '',
    pass: ''
  });
  const [message, setMessage] = useState('');

  // Charger la configuration existante
  useEffect(() => {
    axios.get('http://localhost:5000/api/smtp-config')
      .then(res => {
        if (res.data) {
          setConfig(res.data);
        }
      })
      .catch(() => {
        setMessage('Aucune configuration SMTP trouvée.');
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/smtp-config', config);
      setMessage('Configuration enregistrée avec succès.');
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de la sauvegarde.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
      <h2>🔐 Configuration SMTP</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="host" value={config.host} onChange={handleChange} placeholder="Host" required />
        <input name="port" value={config.port} onChange={handleChange} placeholder="Port" required />
        <label>
          <input type="checkbox" name="secure" checked={config.secure} onChange={handleChange} />
          Connexion sécurisée (SSL)
        </label>
        <input name="user" value={config.user} onChange={handleChange} placeholder="E-mail SMTP" required />
        <input name="pass" value={config.pass} onChange={handleChange} placeholder="Mot de passe SMTP" required />
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}

export default SmtpForm;
