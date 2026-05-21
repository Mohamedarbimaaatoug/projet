const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientName: String,
  roomNumber: String,
  overall: { type: Number, min: 1, max: 5, required: true },
  cleanliness: { type: Number, min: 1, max: 5 },
  service: { type: Number, min: 1, max: 5 },
  comfort: { type: Number, min: 1, max: 5 },
  food: { type: Number, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
