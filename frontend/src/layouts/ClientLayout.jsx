import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const CLIENT_NAV = [
  { path: '/',               icon: '⬡',  label: 'Accueil' },
  { path: '/reclamation',    icon: '📋', label: 'Déposer une réclamation' },
  { path: '/my-reclamations', icon: '🗂️', label: 'Mes réclamations' },
  { path: '/evaluation',     icon: '⭐', label: 'Évaluer notre service' },
];

export default function ClientLayout({ client, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path) => { navigate(path); setOpen(false); };

  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${open ? 'active' : ''}`} onClick={() => setOpen(false)} />
      <button className="mobile-nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
        {open ? '✕' : '☰'}
      </button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="hotel-name">✦ Hôtel Paradis</span>
          <span className="tagline">Espace Client</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {CLIENT_NAV.map((item) => (
            <button
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => go(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="guest-info">Connecté en tant que</div>
          <div className="guest-name">{client?.name}</div>
          <div className="guest-info" style={{ marginTop: 2 }}>Chambre {client?.roomNumber}</div>
          <button className="btn btn-ghost btn-sm btn-full" style={{ marginTop: 12 }} onClick={onLogout}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
