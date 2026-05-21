import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function ChefLoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Remplissez tous les champs'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/chef/login', form);
      toast.success(`Bienvenue, ${data.chef.name} ${data.chef.icon || ''}`);
      onLogin(data.chef);
      navigate('/chef/dashboard', { replace: true });
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
      {/* Blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: 450, height: 450,
          background: 'radial-gradient(circle, rgba(168, 143, 94, 0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350,
          background: 'radial-gradient(circle, rgba(168, 143, 94, 0.04) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div className="animate-fade" style={{ width: '100%', maxWidth: 450, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(168, 143, 94, 0.22), rgba(168, 143, 94, 0.05))',
            border: '1.5px solid rgba(168, 143, 94, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 16px',
            boxShadow: '0 0 36px rgba(168, 143, 94, 0.15)',
          }}>👷</div>
          <h1 style={{ fontSize: '1.7rem', marginBottom: 4 }}>
            <span className="gold">Espace Responsable</span>
          </h1>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            Hôtel Paradis — Chefs de département
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(168, 143, 94, 0.1)', border: '1px solid var(--gold-border)',
            borderRadius: 20, padding: '4px 14px', marginBottom: 20, fontSize: '0.75rem',
            color: 'var(--gold)', fontWeight: 600, letterSpacing: 1,
          }}>
            🏨 PORTAIL CHEFS DE SERVICE
          </div>

          <h2 style={{ fontSize: '1.1rem', marginBottom: 6 }}>Connexion</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 24 }}>
            Gérez les réclamations qui vous ont été assignées par l'administration.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Identifiant</label>
              <input
                className="form-input" type="text" name="username"
                placeholder="ex: maintenance" value={form.username}
                onChange={handleChange} autoFocus autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input" type={showPwd ? 'text' : 'password'}
                  name="password" placeholder="••••••••" value={form.password}
                  onChange={handleChange} autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? '⏳ Connexion...' : '🔓 Accéder à mes réclamations'}
            </button>
          </form>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}
              style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>
              🛡️ Admin
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}
              style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>
              ← Portail client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
