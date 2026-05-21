import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', roomNumber: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (!form.phone.trim()) e.phone = 'Téléphone requis';
    if (!form.roomNumber.trim()) e.roomNumber = 'Numéro de chambre requis';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/clients/login', form);
      toast.success(`Bienvenue, ${data.client.name} ! 🏨`);
      onLogin(data.client);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(168, 143, 94, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(168, 143, 94, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div className="animate-fade" style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(168, 143, 94, 0.2), rgba(168, 143, 94, 0.05))',
            border: '1px solid rgba(168, 143, 94, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(168, 143, 94, 0.2)',
          }}>🏨</div>
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>
            <span className="gold">Hôtel Paradis</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Portail client — Wi-Fi &amp; Services
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: 36 }}>
          <h2 style={{ marginBottom: 6, fontSize: '1.1rem' }}>Bienvenue !</h2>
          <p style={{ fontSize: '0.85rem', marginBottom: 28, color: 'var(--text-muted)' }}>
            Renseignez vos informations pour accéder à nos services.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input className="form-input" type="text" name="name"
                placeholder="Jean Dupont" value={form.name} onChange={handleChange} autoFocus />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Adresse e-mail</label>
              <input className="form-input" type="email" name="email"
                placeholder="vous@email.com" value={form.email} onChange={handleChange} />
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-input" type="tel" name="phone"
                  placeholder="+33 6 12 34 56 78" value={form.phone} onChange={handleChange} />
                {errors.phone && <div className="form-error">⚠ {errors.phone}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">N° de chambre</label>
                <input className="form-input" type="text" name="roomNumber"
                  placeholder="205" value={form.roomNumber} onChange={handleChange} />
                {errors.roomNumber && <div className="form-error">⚠ {errors.roomNumber}</div>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg"
              disabled={loading} style={{ marginTop: 8 }}>
              {loading ? '⏳ Connexion...' : '🚀 Accéder à mes services'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 20 }}>
          © 2025 Hôtel Paradis — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
