import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api, { BACKEND_URL } from '../api/axios';
import { StatusBadge } from './DashboardPage';

const STATUSES = ['Toutes', 'Nouveau', 'En cours', 'Résolu', 'Refusé'];

// Department → Chief mapping (matches backend)
const DEPT_MAP = {
  'Climatisation':  { chief: 'Chef Maintenance',   dept: 'Maintenance',   icon: '❄️' },
  'Plomberie':      { chief: 'Chef Maintenance',   dept: 'Maintenance',   icon: '🔧' },
  'Électricité':    { chief: 'Chef Maintenance',   dept: 'Maintenance',   icon: '⚡' },
  'TV':             { chief: 'Chef Maintenance',   dept: 'Maintenance',   icon: '📺' },
  'Wi-Fi':          { chief: 'Chef Technique',     dept: 'Technique',     icon: '📡' },
  'Ménage':         { chief: 'Chef Ménage',        dept: 'Ménage',        icon: '🧹' },
  'Mini-bar':       { chief: 'Chef Ménage',        dept: 'Ménage',        icon: '🍷' },
  'Restauration':   { chief: 'Chef Restauration',  dept: 'Restauration',  icon: '🍽️' },
  'Bruit':          { chief: 'Chef Sécurité',      dept: 'Sécurité',      icon: '🔊' },
  'Autre':          { chief: 'Directeur',           dept: 'Direction',     icon: '📌' },
};

export default function AdminReclamationsPage() {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Toutes');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filter !== 'Toutes') params.status = filter;
    if (search.trim()) params.search = search.trim();
    api.get('/reclamations', { params })
      .then(({ data }) => setReclamations(data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">🛎️ Gestion des réclamations</h2>
          <p className="page-subtitle">{reclamations.length} réclamation(s) — Administration</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}>🔄 Actualiser</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input"
          style={{ maxWidth: 280, padding: '9px 16px' }}
          placeholder="🔍 Chercher par nom, catégorie, chambre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(s)}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : reclamations.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📭</div>
          <h3>Aucune réclamation trouvée</h3>
          <p>Aucune réclamation ne correspond à vos filtres.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Client</th><th>Chambre</th><th>Catégorie</th>
                <th>Description</th><th>Statut</th><th>Dispatché à</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reclamations.map((c) => (
                <tr key={c._id}>
                  <td className="primary">{c.clientName || '—'}</td>
                  <td>#{c.roomNumber}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>
                      {DEPT_MAP[c.category]?.icon || '📌'} {c.category}
                    </span>
                  </td>
                  <td style={{ maxWidth: 220 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {c.description.length > 70 ? c.description.slice(0, 70) + '…' : c.description}
                    </span>
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    {c.dispatchedTo?.dept ? (
                      <span style={{
                         fontSize: '0.72rem', background: 'rgba(168, 143, 94, 0.1)',
                         color: 'var(--gold)', padding: '2px 8px', borderRadius: 20,
                         border: '1px solid var(--gold-border)', whiteSpace: 'nowrap',
                       }}>
                         🏢 {c.dispatchedTo.dept}
                       </span>
                    ) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelected(c)}
                    >
                      ⚙️ Traiter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <TreatModal
          reclamation={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setReclamations((cs) => cs.map((c) => c._id === updated._id ? updated : c));
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Treat Modal ───────────────────────────────────────────────────────────────
function TreatModal({ reclamation: c, onClose, onUpdated }) {
  const [tab, setTab] = useState('actions'); // 'actions' | 'dispatch'
  const [adminNote, setAdminNote] = useState(c.adminNote || '');
  const [selectedDept, setSelectedDept] = useState(c.category); // pre-select matching dept
  const [loading, setLoading] = useState(false);

  const deptInfo = DEPT_MAP[c.category];

  // Action: accept (En cours), resolve, refuse
  const handleAction = async (newStatus) => {
    setLoading(true);
    try {
      const { data } = await api.patch(`/reclamations/${c._id}/status`, {
        status: newStatus,
        adminNote,
      });
      toast.success(`Statut mis à jour : ${newStatus}`);
      onUpdated(data.reclamation);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Dispatch to department chief
  const handleDispatch = async () => {
    if (!selectedDept) { toast.error('Sélectionnez un département'); return; }
    setLoading(true);
    try {
      const { data } = await api.patch(`/reclamations/${c._id}/dispatch`, { dept: selectedDept });
      toast.success(data.message);
      onUpdated(data.reclamation);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">⚙️ Traiter la réclamation</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {c.clientName} · Chambre #{c.roomNumber}
            </p>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        {/* Info bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: '0.78rem',
            fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: '1px solid var(--gold-border)',
          }}>
            {deptInfo?.icon || '📌'} {c.category}
          </span>
          <StatusBadge status={c.status} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(c.createdAt).toLocaleString('fr-FR')}
          </span>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description du client</label>
          <div style={{
            background: 'var(--bg-input)', borderRadius: 8, padding: '14px 16px',
            fontSize: '0.9rem', lineHeight: 1.6,
          }}>
            {c.description}
          </div>
        </div>

        {/* Photo */}
        {c.photoUrl && (
          <div className="form-group">
            <label className="form-label">Photo jointe</label>
            <img
              src={`${BACKEND_URL}${c.photoUrl}`}
              alt="Photo réclamation"
              style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </div>
        )}

        {/* Already dispatched notice */}
        {c.dispatchedTo?.dept && (
           <div style={{
             background: 'rgba(168, 143, 94, 0.08)', border: '1px solid var(--gold-border)',
             borderRadius: 10, padding: '12px 16px', marginBottom: 16,
             fontSize: '0.83rem', color: 'var(--text-secondary)',
           }}>
            ✅ Déjà dispatché au <strong style={{ color: 'var(--gold)' }}>{c.dispatchedTo.chiefName}</strong>
            &nbsp;({c.dispatchedTo.dept}) le {new Date(c.dispatchedTo.dispatchedAt).toLocaleString('fr-FR')}
          </div>
        )}

        <hr className="divider-gold" style={{ margin: '16px 0' }} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            className={`btn btn-sm ${tab === 'actions' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('actions')}
          >
            ✅ Actions rapides
          </button>
          <button
            className={`btn btn-sm ${tab === 'dispatch' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('dispatch')}
          >
            📤 Envoyer au responsable
          </button>
        </div>

        {/* Tab: Quick Actions */}
        {tab === 'actions' && (
          <div>
            <div className="form-group">
              <label className="form-label">Note / réponse (visible par le client)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Expliquez les mesures prises, délais d'intervention, etc."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8 }}>
               <button
                 className="btn btn-sm"
                 disabled={loading}
                 onClick={() => handleAction('En cours')}
                 style={{
                   background: 'var(--status-progress-bg)', color: 'var(--status-progress)',
                   border: '1px solid rgba(217, 119, 6, 0.3)',
                   padding: '12px 8px', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
                   fontFamily: 'Outfit, sans-serif',
                 }}
               >
                 ⏳ Prendre en charge
               </button>
               <button
                 className="btn btn-sm"
                 disabled={loading}
                 onClick={() => handleAction('Résolu')}
                 style={{
                   background: 'var(--status-resolved-bg)', color: 'var(--status-resolved)',
                   border: '1px solid rgba(5, 150, 105, 0.3)',
                   padding: '12px 8px', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
                   fontFamily: 'Outfit, sans-serif',
                 }}
               >
                 ✅ Marquer résolu
               </button>
               <button
                 className="btn btn-sm"
                 disabled={loading}
                 onClick={() => handleAction('Refusé')}
                 style={{
                   background: 'var(--status-refused-bg)', color: 'var(--status-refused)',
                   border: '1px solid rgba(220, 38, 38, 0.3)',
                   padding: '12px 8px', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
                   fontFamily: 'Outfit, sans-serif',
                 }}
               >
                 ❌ Refuser
               </button>
            </div>
          </div>
        )}

        {/* Tab: Dispatch to chief */}
        {tab === 'dispatch' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Sélectionnez le département responsable. La réclamation sera assignée au chef de service
              correspondant et le statut passera automatiquement à <strong>En cours</strong>.
            </p>

            {/* Category suggestion */}
             {deptInfo && (
               <div style={{
                 background: 'rgba(168, 143, 94, 0.08)', border: '1px solid var(--gold-border)',
                 borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                 fontSize: '0.83rem',
               }}>
                💡 Suggestion basée sur la catégorie <strong style={{ color: 'var(--gold)' }}>{c.category}</strong> :
                &nbsp;<strong>{deptInfo.icon} {deptInfo.chief}</strong> — Département {deptInfo.dept}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {Object.entries(DEPT_MAP).map(([cat, info]) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedDept(cat)}
                  style={{
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif', textAlign: 'left',
                    transition: 'all 0.2s',
                    border: `1px solid ${selectedDept === cat ? 'var(--gold)' : 'var(--border)'}`,
                    background: selectedDept === cat ? 'var(--gold-dim)' : 'var(--bg-input)',
                    color: selectedDept === cat ? 'var(--gold)' : 'var(--text-secondary)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.83rem' }}>{info.icon} {cat}</div>
                  <div style={{ fontSize: '0.72rem', marginTop: 2, opacity: 0.75 }}>
                    {info.chief} · {info.dept}
                  </div>
                </button>
              ))}
            </div>

            {selectedDept && (
              <div style={{
                background: 'var(--bg-input)', borderRadius: 10, padding: '14px 16px', marginBottom: 16,
                border: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: '0.82rem', marginBottom: 4 }}>
                  <strong style={{ color: 'var(--gold)' }}>Destinataire :</strong>
                </p>
                <p style={{ fontSize: '0.85rem' }}>
                  {DEPT_MAP[selectedDept]?.icon} <strong>{DEPT_MAP[selectedDept]?.chief}</strong>
                  &nbsp;— Département <em>{DEPT_MAP[selectedDept]?.dept}</em>
                </p>
              </div>
            )}

            <button
              className="btn btn-primary btn-full"
              disabled={loading || !selectedDept}
              onClick={handleDispatch}
              style={{ marginTop: 4 }}
            >
              {loading ? '⏳ Envoi...' : `📤 Envoyer au ${DEPT_MAP[selectedDept]?.chief || 'responsable'}`}
            </button>
          </div>
        )}

        {/* Footer cancel */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
