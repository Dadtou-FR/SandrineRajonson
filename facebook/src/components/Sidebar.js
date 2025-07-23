import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css'; // Importez le fichier CSS

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const goTo = (path) => navigate(path);

  const handleLogout = () => {
    const confirm = window.confirm("Se déconnecter ?");
    if (confirm) {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  return (
    <div className="sidebar">
      {/* Section Profil */}
      <div className="profileSection">
        <div className="profileItem">
          <img
            src={`http://localhost:5000${user?.photo || '/uploads/profile/default.jpg'}`}
            alt="Profil"
            className="profileAvatar"
          />
          <span className="profileName">{user?.nom}</span>
        </div>
      </div>

      {/* Navigation principale */}
      <div className="navSection">
        <button onClick={() => goTo('/dashboard')} className="navItem">
          <div className="navIcon">🏠</div>
          <span>Accueil</span>
        </button>
        
        <button onClick={() => goTo('/amis')} className="navItem">
          <div className="navIcon">👥</div>
          <span>Amis</span>
        </button>

        <button onClick={() => goTo('/groupes')} className="navItem">
          <div className="navIcon">👨‍👩‍👧‍👦</div>
          <span>Groupes</span>
        </button>

        <button onClick={() => goTo('/enregistrements')} className="navItem">
          <div className="navIcon">🔖</div>
          <span>Enregistrements</span>
        </button>

        <button onClick={() => goTo('/reels')} className="navItem">
          <div className="navIcon">🎬</div>
          <span>Reels</span>
        </button>

        <button onClick={() => goTo('/evenements')} className="navItem">
          <div className="navIcon">📅</div>
          <span>Évènements</span>
        </button>

        <button onClick={() => goTo('/messages')} className="navItem">
          <div className="navIcon">💬</div>
          <span>Messages</span>
        </button>
      </div>

      {/* Section Raccourcis */}
      <div className="shortcutsSection">
        <div className="sectionTitle">Vos raccourcis</div>
        <button className="shortcutItem">
          <div className="shortcutIcon">👥</div>
          <span>Groupe de classe</span>
        </button>
        <button className="shortcutItem">
          <div className="shortcutIcon">⚽</div>
          <span>Football Madagascar</span>
        </button>
      </div>

      {/* Section Paramètres en bas */}
      <div className="bottomSection">
        <button onClick={() => goTo('/parametres')} className="navItem">
          <div className="navIcon">⚙️</div>
          <span>Paramètres</span>
        </button>
        
        <button onClick={handleLogout} className="logoutItem">
          <div className="navIcon">🚪</div>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;