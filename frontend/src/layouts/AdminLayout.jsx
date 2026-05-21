import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const ADMIN_NAV = [
  { path: '/admin/dashboard',   icon: '📊', label: 'Tableau de bord' },
  { path: '/admin/reclamations', icon: '🛎️', label: 'Réclamations' },
  { path: '/admin/clients',      icon: '👥', label: 'Clients' },
];

export default function AdminLayout({ admin, onLogout }) {
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
          <span className="tagline" style={{ color: 'var(--gold)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 2 }}>
            Administration
          </span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-title">Gestion</div>
          {ADMIN_NAV.map((item) => (
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
          <div className="guest-info">Connecté en tant qu'admin</div>
          <div className="guest-name">{admin?.name || 'Administrateur'}</div>
          <div style={{ marginTop: 4 }}>
            <span style={{ background: 'rgba(168, 143, 94, 0.15)', color: 'var(--gold)', fontSize: '0.7rem', padding: '2px 10px', borderRadius: 20, fontWeight: 700, border: '1px solid var(--gold-border)' }}>
              ADMIN
            </span>
          </div>
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
