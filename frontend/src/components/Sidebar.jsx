import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS_CLIENT = [
  { path: '/dashboard', icon: '⬡', label: 'Accueil' },
  { path: '/reclamation', icon: '📋', label: 'Déposer une réclamation' },
  { path: '/my-reclamations', icon: '🗂️', label: 'Mes réclamations' },
  { path: '/evaluation', icon: '⭐', label: 'Évaluer notre service' },
];

const NAV_ITEMS_ADMIN = [
  { path: '/admin/reclamations', icon: '🛎️', label: 'Réclamations' },
  { path: '/admin/clients', icon: '👥', label: 'Clients' },
];

export default function Sidebar({ client, open, onClose, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="hotel-name">✦ Hôtel Paradis</span>
        <span className="tagline">Client Experience Portal</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {NAV_ITEMS_CLIENT.map((item) => (
          <button
            key={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNav(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {client?.isAdmin && (
          <>
            <div className="nav-section-title">Administration</div>
            {NAV_ITEMS_ADMIN.map((item) => (
              <button
                key={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="guest-info">Connecté en tant que</div>
        <div className="guest-name">{client?.name}</div>
        <div className="guest-info" style={{ marginTop: 2 }}>Chambre {client?.roomNumber}</div>
        <button
          className="btn btn-ghost btn-sm btn-full"
          style={{ marginTop: 12 }}
          onClick={onLogout}
        >
          🚪 Déconnexion
        </button>
      </div>
    </aside>
  );
}
