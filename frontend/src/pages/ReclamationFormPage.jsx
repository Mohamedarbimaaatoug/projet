import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const CATEGORIES = [
  'Climatisation', 'Plomberie', 'Électricité', 'Ménage',
  'Restauration', 'Wi-Fi', 'Mini-bar', 'TV', 'Bruit', 'Autre'
];

export default function ReclamationFormPage({ client }) {
  const [form, setForm] = useState({ category: '', description: '' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const validate = () => {
    const e = {};
    if (!form.category) e.category = 'Catégorie requise';
    if (!form.description.trim() || form.description.length < 10) e.description = 'Description trop courte (min 10 caractères)';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Fichier trop volumineux (max 5 Mo)'); return; }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('clientId', client._id);
      fd.append('clientName', client.name);
      fd.append('roomNumber', client.roomNumber);
      fd.append('category', form.category);
      fd.append('description', form.description);
      if (photo) fd.append('photo', photo);

      await api.post('/reclamations', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
      toast.success('Réclamation envoyée avec succès !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ category: '', description: '' });
    setPhoto(null);
    setPhotoPreview(null);
    setSuccess(false);
    setErrors({});
  };

  if (success) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }} className="animate-fade">
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>✅</div>
          <h2 style={{ marginBottom: 12 }}>Réclamation envoyée !</h2>
          <p style={{ marginBottom: 32 }}>
            Votre réclamation a bien été reçue. Notre équipe la traitera dans les plus brefs délais.
            Vous pouvez suivre son avancement depuis "Mes réclamations".
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleReset}>
              + Nouvelle réclamation
            </button>
            <button className="btn btn-ghost" onClick={() => window.location.href = '/my-reclamations'}>
              🗂️ Mes réclamations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }} className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">📋 Déposer une réclamation</h2>
          <p className="page-subtitle">Chambre {client?.roomNumber} · {client?.name}</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Category */}
          <div className="form-group">
            <label className="form-label">Catégorie du problème *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setForm(f => ({ ...f, category: cat })); setErrors(e => ({ ...e, category: undefined })); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: `1px solid ${form.category === cat ? 'var(--gold)' : 'var(--border)'}`,
                    background: form.category === cat ? 'var(--gold-dim)' : 'var(--bg-input)',
                    color: form.category === cat ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: form.category === cat ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {form.category === cat ? '✓ ' : ''}{cat}
                </button>
              ))}
            </div>
            {errors.category && <div className="form-error" style={{ marginTop: 8 }}>⚠ {errors.category}</div>}
          </div>

          <hr className="divider-gold" />

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description du problème *</label>
            <textarea
              className="form-textarea"
              name="description"
              rows={5}
              placeholder="Décrivez le problème en détail : quand il s'est produit, son impact, etc."
              value={form.description}
              onChange={handleChange}
            />
            {errors.description && <div className="form-error">⚠ {errors.description}</div>}
            <div className="form-hint">{form.description.length}/500 caractères</div>
          </div>

          {/* Photo upload */}
          <div className="form-group">
            <label className="form-label">Photo (optionnel)</label>
            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border)' }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className={`upload-area ${drag ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <div className="upload-icon">📷</div>
                <div className="upload-label">
                  <strong>Glissez une image</strong> ou cliquez pour parcourir
                </div>
                <div className="form-hint" style={{ marginTop: 6 }}>JPG, PNG, WebP · Max 5 Mo</div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? '⏳ Envoi en cours…' : '📨 Envoyer la réclamation'}
          </button>
        </form>
      </div>
    </div>
  );
}
