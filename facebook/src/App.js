import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profil from './pages/Profil';
import Amis from './pages/Amis';
import Enregistrements from './pages/Enregistrements';
import Groupes from './pages/Groupes';
import Reels from './pages/Reels';
import Evenements from './pages/Evenements';
import Parametres from './pages/Parametres';
import Sidebar from './components/Sidebar';
import ForgotPassword from './pages/ForgotPassword';
import Message from './pages/Message';
import SmtpForm from './components/SmtpForm';

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const amis = JSON.parse(localStorage.getItem("amis")) || [];// ✅ récupérer le user


  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {/* ✅ Afficher la Sidebar seulement si l'utilisateur est connecté */}
        {user && <Sidebar />}
        <div style={{ marginTop: user ? 80 : 0, padding: 20 }}>
          <Routes>
            <Route path="/smtp" element={<SmtpForm />} />
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/amis" element={<Amis />} />
            <Route path="/enregistrements" element={<Enregistrements />} />
            <Route path="/groupes" element={<Groupes />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/evenements" element={<Evenements />} />
            <Route path="/parametres" element={<Parametres />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/messages"element={<Message currentUser={user} friends={amis} />}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
