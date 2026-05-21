const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

// POST /api/evaluations — Submit evaluation
router.post('/', async (req, res) => {
  try {
    const { clientId, clientName, roomNumber, overall, cleanliness, service, comfort, food, comment } = req.body;
    if (!clientId || !overall) {
      return res.status(400).json({ message: 'Champs manquants' });
    }
    const evaluation = new Evaluation({ clientId, clientName, roomNumber, overall, cleanliness, service, comfort, food, comment });
    await evaluation.save();
    res.status(201).json({ message: 'Évaluation envoyée', evaluation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/evaluations — All evaluations (admin)
router.get('/', async (req, res) => {
  try {
    const evaluations = await Evaluation.find().sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
