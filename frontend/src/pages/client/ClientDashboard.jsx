import { useNavigate } from 'react-router-dom';

export default function ClientDashboard({ client }) {
  const navigate = useNavigate();

  return (
    <div className="animate-fade">
      {/* Hero welcome */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 143, 94, 0.12) 0%, rgba(168, 143, 94, 0.03) 100%)',
        border: '1px solid var(--gold-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 40px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(168, 143, 94, 0.15), transparent)',
          borderRadius: '50%',
        }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 2, color: 'var(--gold)', marginBottom: 8 }}>
            ✦ Bienvenue
          </p>
          <h1 style={{ fontSize: '1.9rem', marginBottom: 8 }}>
            Bonjour, {client?.name} 👋
          </h1>
          <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>
            Chambre <strong style={{ color: 'var(--gold)' }}>#{client?.roomNumber}</strong>
            &nbsp;· Comment puis-je vous aider aujourd'hui ?
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/reclamation')}>
              📋 Déposer une réclamation
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/evaluation')}>
              ⭐ Évaluer notre service
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid-3 stagger">
        <QuickAction
          icon="📋"
          title="Faire une réclamation"
          desc="Signalez un problème dans votre chambre ou à l'hôtel"
          onClick={() => navigate('/reclamation')}
        />
        <QuickAction
          icon="🗂️"
          title="Mes demandes"
          desc="Suivez l'état de vos réclamations en temps réel"
          onClick={() => navigate('/my-reclamations')}
        />
        <QuickAction
          icon="⭐"
          title="Évaluer notre service"
          desc="Partagez votre avis et notez nos prestations"
          onClick={() => navigate('/evaluation')}
        />
      </div>

      {/* Info banner */}
      <div style={{
        marginTop: 28,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex', gap: 16, alignItems: 'center',
      }}>
        <span style={{ fontSize: '1.8rem' }}>ℹ️</span>
        <div>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Informations pratiques</p>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Réception : 24h/24 — Petit-déjeuner : 7h–10h30 — Piscine : 9h–20h — Wi-Fi inclus dans toutes les chambres.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, desc, onClick }) {
  return (
    <button className="card" style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--bg-card)' }} onClick={onClick}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>{icon}</div>
      <h3 style={{ marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{desc}</p>
      <div style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600, marginTop: 12 }}>Accéder →</div>
    </button>
  );
}
