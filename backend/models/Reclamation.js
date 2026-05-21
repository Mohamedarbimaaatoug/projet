const mongoose = require('mongoose');

const reclamationSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientName: String,
  roomNumber: String,
  category: {
    type: String,
    enum: ['Climatisation', 'Plomberie', 'Électricité', 'Ménage', 'Restauration', 'Wi-Fi', 'Mini-bar', 'TV', 'Bruit', 'Autre'],
    required: true
  },
  description: { type: String, required: true },
  photoUrl: { type: String, default: null },
  status: {
    type: String,
    enum: ['Nouveau', 'En cours', 'Résolu', 'Refusé'],
    default: 'Nouveau'
  },
  adminNote: { type: String, default: '' },
  dispatchedTo: {
    dept: { type: String, default: '' },
    chiefName: { type: String, default: '' },
    chiefEmail: { type: String, default: '' },
    dispatchedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

reclamationSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Reclamation', reclamationSchema);
