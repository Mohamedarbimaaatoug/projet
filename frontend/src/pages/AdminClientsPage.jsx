import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/clients')
      .then(({ data }) => setClients(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.roomNumber.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">👥 Clients enregistrés</h2>
          <p className="page-subtitle">{clients.length} client(s) au total</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          className="form-input"
          style={{ maxWidth: 340, padding: '9px 16px' }}
          placeholder="🔍 Nom, email, chambre, téléphone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">👤</div>
          <h3>Aucun client trouvé</h3>
          <p>{search ? 'Aucun client ne correspond à votre recherche.' : 'Aucun client enregistré pour le moment.'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Chambre</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c._id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: '50%',
                        background: 'var(--gold-dim)',
                        border: '1px solid var(--gold-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold)',
                        flexShrink: 0,
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{c.email}</td>
                  <td style={{ fontSize: '0.85rem' }}>{c.phone}</td>
                  <td>
                    <span style={{ background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--gold-border)' }}>
                      #{c.roomNumber}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary cards */}
      {!loading && clients.length > 0 && (
        <div className="grid-3 stagger" style={{ marginTop: 28 }}>
          <SummaryCard icon="👤" label="Total clients" value={clients.length} />
          <SummaryCard icon="🏠" label="Chambres occupées" value={new Set(clients.map(c => c.roomNumber)).size} />
          <SummaryCard icon="📅" label="Nouveaux aujourd'hui"
            value={clients.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}
          />
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
