import { useState, useEffect } from 'react';
import api from '../api/axios';
import { StatusBadge } from './DashboardPage';

const STATUSES = ['Toutes', 'Nouveau', 'En cours', 'Résolu', 'Refusé'];

export default function MyReclamationsPage({ client }) {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Toutes');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    const params = filter !== 'Toutes' ? { status: filter } : {};
    api.get(`/reclamations/client/${client._id}`, { params })
      .then(({ data }) => setReclamations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">🗂️ Mes réclamations</h2>
          <p className="page-subtitle">Chambre {client?.roomNumber} · {reclamations.length} réclamation(s)</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}>🔄 Actualiser</button>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : reclamations.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📭</div>
          <h3>Aucune réclamation</h3>
          <p>Vous n'avez aucune réclamation {filter !== 'Toutes' ? `avec le statut "${filter}"` : 'pour le moment'}.</p>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reclamations.map((r) => (
            <ReclamationCard key={r._id} reclamation={r} onClick={() => setSelected(r)} />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <ReclamationModal reclamation={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ReclamationCard({ reclamation: r, onClick }) {
  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{
              background: 'var(--gold-dim)', color: 'var(--gold)',
              fontSize: '0.75rem', fontWeight: 600,
              padding: '3px 10px', borderRadius: 20,
              border: '1px solid var(--gold-border)',
            }}>
              {r.category}
            </span>
            <StatusBadge status={r.status} />
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.5 }}>
            {r.description.length > 120 ? r.description.slice(0, 120) + '…' : r.description}
          </p>
          {r.adminNote && (
            <div style={{
              background: 'var(--bg-input)', borderRadius: 8, padding: '10px 14px',
              marginTop: 10, borderLeft: '3px solid var(--gold)',
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Note admin</span>
              <p style={{ fontSize: '0.85rem', marginTop: 4, color: 'var(--text-secondary)' }}>{r.adminNote}</p>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', minWidth: 120 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          {r.photoUrl && (
            <div style={{ marginTop: 8 }}>
              <img
                src={`http://localhost:5000${r.photoUrl}`}
                alt="Photo"
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReclamationModal({ reclamation: r, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Détail de la réclamation</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: '1px solid var(--gold-border)' }}>
            {r.category}
          </span>
          <StatusBadge status={r.status} />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.7, background: 'var(--bg-input)', padding: '14px 16px', borderRadius: 8 }}>
            {r.description}
          </p>
        </div>

        {r.photoUrl && (
          <div className="form-group">
            <label className="form-label">Photo jointe</label>
            <img
              src={`http://localhost:5000${r.photoUrl}`}
              alt="Photo réclamation"
              style={{ maxWidth: '100%', borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </div>
        )}

        {r.adminNote && (
          <div style={{ background: 'var(--bg-input)', borderRadius: 10, padding: '16px 18px', borderLeft: '3px solid var(--gold)' }}>
            <label className="form-label">Réponse de l'équipe</label>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.adminNote}</p>
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Créé le {new Date(r.createdAt).toLocaleString('fr-FR')}</span>
          <span>MAJ {new Date(r.updatedAt).toLocaleString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
}
