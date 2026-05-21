import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const CRITERIA = [
  { key: 'overall', label: 'Note globale', icon: '⭐', required: true },
  { key: 'cleanliness', label: 'Propreté', icon: '🧹' },
  { key: 'service', label: 'Service', icon: '🛎️' },
  { key: 'comfort', label: 'Confort', icon: '🛏️' },
  { key: 'food', label: 'Restauration', icon: '🍽️' },
];

function StarRating({ value, onChange, label }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || value) ? 'filled' : 'empty'}`}
          style={{ fontSize: '1.8rem' }}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          role="button"
          tabIndex={0}
          aria-label={`${star} étoile${star > 1 ? 's' : ''} pour ${label}`}
          onKeyDown={(e) => e.key === 'Enter' && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

const LABEL_MAP = { 1: 'Très mauvais', 2: 'Mauvais', 3: 'Correct', 4: 'Bien', 5: 'Excellent' };

export default function EvaluationPage({ client }) {
  const [ratings, setRatings] = useState({ overall: 0, cleanliness: 0, service: 0, comfort: 0, food: 0 });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ratings.overall) { toast.error('Veuillez donner une note globale'); return; }

    setLoading(true);
    try {
      await api.post('/evaluations', {
        clientId: client._id,
        clientName: client.name,
        roomNumber: client.roomNumber,
        ...ratings,
        comment,
      });
      setSuccess(true);
      toast.success('Merci pour votre évaluation ! 🙏');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }} className="animate-fade">
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🙏</div>
          <h2 style={{ marginBottom: 12 }}>Merci pour votre retour !</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
            {[1,2,3,4,5].map((s) => (
              <span key={s} style={{ fontSize: '1.5rem', color: s <= ratings.overall ? 'var(--gold)' : 'var(--border)' }}>★</span>
            ))}
          </div>
          <p>Votre avis nous aide à améliorer continuellement la qualité de nos services. Nous espérons vous revoir bientôt au Paradis.</p>
          <div style={{ marginTop: 8, color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 600 }}>
            — L'équipe Hôtel Paradis
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }} className="animate-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">⭐ Évaluez notre service</h2>
          <p className="page-subtitle">Votre avis compte énormément pour nous</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Criteria ratings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {CRITERIA.map(({ key, label, icon, required }) => (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 16, flexWrap: 'wrap',
                paddingBottom: 24,
                borderBottom: '1px solid var(--border-card)',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {label}
                      {required && <span style={{ color: 'var(--gold)', marginLeft: 4 }}>*</span>}
                    </span>
                  </div>
                  {ratings[key] > 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontStyle: 'italic' }}>
                      {LABEL_MAP[ratings[key]]}
                    </span>
                  )}
                </div>
                <StarRating
                  value={ratings[key]}
                  onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))}
                  label={label}
                />
              </div>
            ))}
          </div>

          {/* Overall visual score */}
          {ratings.overall > 0 && (
            <div style={{
              background: 'var(--gold-dim)',
              border: '1px solid var(--gold-border)',
              borderRadius: 12,
              padding: '20px 24px',
              textAlign: 'center',
              marginTop: 24,
              marginBottom: 8,
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--gold)', fontFamily: 'Playfair Display, serif' }}>
                {ratings.overall} / 5
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {LABEL_MAP[ratings.overall]}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="form-group" style={{ marginTop: 24 }}>
            <label className="form-label">Commentaire (optionnel)</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Partagez votre expérience, vos suggestions ou tout autre commentaire…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || !ratings.overall}
          >
            {loading ? '⏳ Envoi…' : '🚀 Envoyer mon évaluation'}
          </button>
        </form>
      </div>
    </div>
  );
}
