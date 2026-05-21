import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api, { BACKEND_URL } from '../../api/axios';
import { StatusBadge } from '../DashboardPage';

const STATUS_TABS = ['Toutes', 'En cours', 'Résolu'];

// Status color map for action buttons
const ACTION_BTN = {
  progress: {
    bg: 'rgba(245,180,41,0.12)', color: '#F5B429',
    border: 'rgba(245,180,41,0.3)', label: '⏳ En cours d\'intervention',
  },
  resolve: {
    bg: 'rgba(52,199,89,0.1)', color: '#34C759',
    border: 'rgba(52,199,89,0.3)', label: '✅ Marquer résolu',
  },
};

export default function ChefDashboard({ chef }) {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Toutes');
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    if (!chef?.dept) return;
    setLoading(true);
    const params = { dept: chef.dept };
    if (filter !== 'Toutes') params.status = filter;
    api.get('/chef/reclamations', { params })
      .then(({ data }) => setReclamations(data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [chef, filter]);

  useEffect(() => { load(); }, [load]);

  const total    = reclamations.length;
  const enCours  = reclamations.filter(c => c.status === 'En cours').length;
  const resolus  = reclamations.filter(c => c.status === 'Résolu').length;
  const nouveaux = reclamations.filter(c => c.status === 'Nouveau').length;

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            {chef?.icon} Mes réclamations assignées
          </h2>
          <p className="page-subtitle">
            {chef?.title} — Département {chef?.dept}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}>🔄 Actualiser</button>
      </div>

      {/* KPI mini-cards */}
      <div className="grid-4 stagger" style={{ marginBottom: 28 }}>
        <MiniStat label="Total assignées"   value={total}    color="var(--gold)" />
        <MiniStat label="Nouvelles"         value={nouveaux} color="var(--status-new)" />
        <MiniStat label="En cours"          value={enCours}  color="var(--status-progress)" />
        <MiniStat label="Résolues"          value={resolus}  color="var(--status-resolved)" />
      </div>

      {/* No complaints dispatched yet */}
      {!loading && total === 0 && filter === 'Toutes' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(168, 143, 94, 0.08), rgba(168, 143, 94, 0.02))',
          border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-xl)',
          padding: '48px 32px', textAlign: 'center', marginBottom: 24,
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
          <h3 style={{ marginBottom: 8 }}>Aucune réclamation assignée</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            L'administration n'a pas encore dispatché de réclamations à votre département.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      {total > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {STATUS_TABS.map((s) => (
            <button key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(s)}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Reclamations list */}
      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : reclamations.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📭</div>
          <p>Aucune réclamation dans ce filtre</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reclamations.map((c) => (
            <ReclamationCard
              key={c._id}
              reclamation={c}
              onAction={() => setSelected(c)}
            />
          ))}
        </div>
      )}

      {/* Intervention modal */}
      {selected && (
        <InterventionModal
          reclamation={selected}
          chef={chef}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setReclamations(cs => cs.map(c => c._id === updated._id ? updated : c));
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

// ── Mini KPI card ────────────────────────────────────────────────────────────
function MiniStat({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── Reclamation card ───────────────────────────────────────────────────────────
function ReclamationCard({ reclamation: c, onAction }) {
  const isNew      = c.status === 'Nouveau';
  const isResolved = c.status === 'Résolu';

  return (
    <div className="card" style={{
      display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
      borderLeft: isNew ? '3px solid var(--status-new)' : isResolved ? '3px solid var(--status-resolved)' : '3px solid var(--status-progress)',
    }}>
      {/* Left: info */}
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem' }}>
            {c.category}
          </span>
          <StatusBadge status={c.status} />
          {isNew && (
            <span style={{
              background: 'rgba(255,59,48,0.12)', color: '#FF3B30',
              fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20,
              fontWeight: 700, border: '1px solid rgba(255,59,48,0.25)',
            }}>NOUVEAU</span>
          )}
        </div>

        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 10, color: 'var(--text-primary)' }}>
          {c.description}
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>👤 {c.clientName || 'Client'}</span>
          <span>🏠 Chambre #{c.roomNumber}</span>
          <span>📅 {new Date(c.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {c.adminNote && (
          <div style={{
            marginTop: 12, background: 'var(--bg-input)', borderRadius: 8,
            padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)',
            borderLeft: '2px solid var(--gold)',
          }}>
            💬 <em>{c.adminNote}</em>
          </div>
        )}
      </div>

      {/* Right: photo + action */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
        {c.photoUrl && (
          <img
            src={`${BACKEND_URL}${c.photoUrl}`}
            alt="Photo"
            style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
          />
        )}
        {!isResolved && (
          <button className="btn btn-primary btn-sm" onClick={onAction}>
            ⚙️ Intervenir
          </button>
        )}
        {isResolved && (
          <span style={{ fontSize: '0.78rem', color: 'var(--status-resolved)', fontWeight: 600 }}>
            ✅ Traité
          </span>
        )}
      </div>
    </div>
  );
}

// ── Intervention modal ───────────────────────────────────────────────────────
function InterventionModal({ reclamation: c, chef, onClose, onUpdated }) {
  const [note, setNote] = useState(c.adminNote || '');
  const [status, setStatus] = useState('Résolu');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch(`/chef/reclamations/${c._id}/resolve`, {
        interventionNote: note,
        status,
      });
      toast.success(data.message);
      onUpdated(data.reclamation);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{chef?.icon} Rapport d'intervention</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {c.category} · {c.clientName} · Chambre #{c.roomNumber}
            </p>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        {/* Complaint summary */}
        <div style={{
          background: 'var(--bg-input)', borderRadius: 10, padding: '14px 16px',
          marginBottom: 20, fontSize: '0.88rem', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: 4 }}>
            Problème signalé :
          </strong>
          {c.description}
        </div>

        {/* Photo */}
        {c.photoUrl && (
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">📷 Photo du problème</label>
            <img
              src={`${BACKEND_URL}${c.photoUrl}`}
              alt="Photo réclamation"
              style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </div>
        )}

        <hr className="divider-gold" style={{ margin: '0 0 20px' }} />

        {/* Status choice */}
        <div className="form-group">
          <label className="form-label">Résultat de l'intervention</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { val: 'En cours', bg: 'rgba(245,180,41,0.12)', color: '#F5B429', border: 'rgba(245,180,41,0.3)', label: '⏳ En cours' },
              { val: 'Résolu',   bg: 'rgba(52,199,89,0.10)',   color: '#34C759', border: 'rgba(52,199,89,0.3)',   label: '✅ Résolu' },
            ].map((opt) => (
              <button
                key={opt.val} type="button" onClick={() => setStatus(opt.val)}
                style={{
                  flex: 1, padding: '12px 10px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  background: status === opt.val ? opt.bg : 'var(--bg-input)',
                  color: status === opt.val ? opt.color : 'var(--text-secondary)',
                  border: `1px solid ${status === opt.val ? opt.border : 'var(--border)'}`,
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Intervention note */}
        <div className="form-group">
          <label className="form-label">
            Rapport d'intervention
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>(visible par le client et l'admin)</span>
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder={`Décrivez les actions effectuées, pièces remplacées, délais…\nEx: Technicien intervenu à 14h00. Filtre climatisation nettoyé et gaz rechargé. Problème résolu.`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !note.trim()}>
            {loading ? '⏳ Envoi...' : '📤 Soumettre le rapport'}
          </button>
        </div>
      </div>
    </div>
  );
}
