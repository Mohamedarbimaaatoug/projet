import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminLoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      toast.success(`Bienvenue, ${data.admin.name} 🔑`);
      onLogin(data.admin);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--bg-base)',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(168,143,94,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(168,143,94,0.04) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div className="animate-fade" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(168,143,94,0.25), rgba(168,143,94,0.05))',
            border: '1.5px solid rgba(168,143,94,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', margin: '0 auto 20px',
            boxShadow: '0 0 40px rgba(168,143,94,0.18)',
          }}>🔐</div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>
            <span className="gold">Hôtel Paradis</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Accès réservé — Administration
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(168,143,94,0.1)', border: '1px solid var(--gold-border)',
            borderRadius: 20, padding: '4px 14px', marginBottom: 24, fontSize: '0.78rem',
            color: 'var(--gold)', fontWeight: 600, letterSpacing: 1,
          }}>
            🛡️ ESPACE ADMINISTRATEUR
          </div>

          <h2 style={{ marginBottom: 6, fontSize: '1.15rem' }}>Connexion sécurisée</h2>
          <p style={{ fontSize: '0.82rem', marginBottom: 28, color: 'var(--text-muted)' }}>
            Entrez vos identifiants administrateur pour accéder au panneau de gestion.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Identifiant</label>
              <input
                className="form-input"
                type="text"
                name="username"
                placeholder="admin"
                value={form.username}
                onChange={handleChange}
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)',
                  }}
                  tabIndex={-1}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgba(168,143,94,0.05)', border: '1px solid var(--gold-border)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 24, fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}>
              💡 Identifiants par défaut : <strong style={{ color: 'var(--text-secondary)' }}>admin</strong> / <strong style={{ color: 'var(--text-secondary)' }}>hotel2025</strong>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? '⏳ Vérification...' : '🔓 Accéder au panneau'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/login')}
              style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
            >
              ← Retour au portail client
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 20 }}>
          © 2025 Hôtel Paradis — Accès restreint
        </p>
      </div>
    </div>
  );
}
