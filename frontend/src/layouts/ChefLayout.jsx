import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function ChefLayout({ chef, onLogout }) {
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
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="hotel-name">✦ Hôtel Paradis</span>
          <span className="tagline" style={{ color: 'var(--gold-light)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 2 }}>
            {chef?.icon} {chef?.dept}
          </span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          <button
            className={`nav-link ${location.pathname === '/chef/dashboard' ? 'active' : ''}`}
            onClick={() => go('/chef/dashboard')}
          >
            <span className="nav-icon">📋</span>
            Mes réclamations
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="guest-info">Connecté en tant que</div>
          <div className="guest-name">{chef?.name}</div>
          <div style={{ marginTop: 4 }}>
            <span style={{
              background: 'rgba(168, 143, 94, 0.15)', color: 'var(--gold)',
              fontSize: '0.68rem', padding: '2px 10px', borderRadius: 20,
              fontWeight: 700, border: '1px solid var(--gold-border)',
            }}>
              {chef?.title?.toUpperCase()}
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
