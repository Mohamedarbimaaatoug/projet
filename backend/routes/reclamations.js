const express = require('express');
const router = express.Router();
const multer = require('multer');
const { DEPARTMENT_CHIEFS } = require('./admin');
const path = require('path');
const fs = require('fs');
const Reclamation = require('../models/Reclamation');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `reclamation_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/reclamations — All reclamations (admin view)
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'Toutes') query.status = status;
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const reclamations = await Reclamation.find(query).sort({ createdAt: -1 });
    res.json(reclamations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reclamations/client/:clientId — Client's own reclamations
router.get('/client/:clientId', async (req, res) => {
  try {
    const { status } = req.query;
    let query = { clientId: req.params.clientId };
    if (status && status !== 'Toutes') query.status = status;
    const reclamations = await Reclamation.find(query).sort({ createdAt: -1 });
    res.json(reclamations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reclamations/:id — Single reclamation
router.get('/:id', async (req, res) => {
  try {
    const reclamation = await Reclamation.findById(req.params.id);
    if (!reclamation) return res.status(404).json({ message: 'Réclamation non trouvée' });
    res.json(reclamation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reclamations — Create reclamation
router.post('/', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Erreur upload fichier' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { clientId, clientName, roomNumber, category, description } = req.body;
    if (!clientId || !category || !description) {
      return res.status(400).json({ message: 'Champs manquants' });
    }
    const reclamation = new Reclamation({
      clientId,
      clientName,
      roomNumber,
      category,
      description,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    await reclamation.save();
    res.status(201).json({ message: 'Réclamation envoyée', reclamation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/reclamations/:id/status — Update status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ['Nouveau', 'En cours', 'Résolu', 'Refusé'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    const reclamation = await Reclamation.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '', updatedAt: new Date() },
      { new: true }
    );
    if (!reclamation) return res.status(404).json({ message: 'Réclamation non trouvée' });
    res.json({ message: 'Statut mis à jour', reclamation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/reclamations/:id/dispatch — Dispatch to department chief
router.patch('/:id/dispatch', async (req, res) => {
  try {
    const { dept } = req.body;
    const chief = DEPARTMENT_CHIEFS[dept];
    if (!chief) return res.status(400).json({ message: 'Département inconnu' });

    const reclamation = await Reclamation.findByIdAndUpdate(
      req.params.id,
      {
        status: 'En cours',
        updatedAt: new Date(),
        dispatchedTo: {
          dept: chief.dept,
          chiefName: chief.name,
          chiefEmail: chief.email,
          dispatchedAt: new Date()
        }
      },
      { new: true }
    );
    if (!reclamation) return res.status(404).json({ message: 'Réclamation non trouvée' });
    res.json({ message: `Réclamation envoyée à ${chief.name} (${chief.dept})`, reclamation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
