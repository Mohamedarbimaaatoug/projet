// This file only exports StatusBadge (shared utility).
// Client dashboard is in pages/client/ClientDashboard.jsx
// Admin dashboard is in pages/admin/AdminDashboard.jsx

export function StatusBadge({ status }) {
  const map = {
    'Nouveau':  'badge-new',
    'En cours': 'badge-progress',
    'Résolu':   'badge-resolved',
    'Refusé':   'badge-refused',
  };
  const dots = {
    'Nouveau': '🔵', 'En cours': '🟡', 'Résolu': '🟢', 'Refusé': '🔴',
  };
  return <span className={`badge ${map[status] || ''}`}>{dots[status]} {status}</span>;
}
