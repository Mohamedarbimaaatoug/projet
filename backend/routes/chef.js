const express = require('express');
const router = express.Router();
const Chef = require('../models/Chef');
const Reclamation = require('../models/Reclamation');

// POST /api/chef/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Identifiants manquants' });
    }

    const chef = await Chef.findOne({
      username: username.trim().toLowerCase(),
      password: password
    });

    if (!chef) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const safeChef = chef.toObject();
    delete safeChef.password;
    return res.json({ message: 'Connexion réussie', chef: safeChef });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/chef/reclamations?dept=Maintenance — Get dispatched reclamations for a dept
router.get('/reclamations', async (req, res) => {
  try {
    const { dept, status } = req.query;
    if (!dept) return res.status(400).json({ message: 'Département requis' });

    const query = { 'dispatchedTo.dept': dept };
    if (status && status !== 'Toutes') query.status = status;

    const reclamations = await Reclamation.find(query).sort({ createdAt: -1 });
    res.json(reclamations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/chef/reclamations/:id/resolve — Chef marks reclamation as resolved
router.patch('/reclamations/:id/resolve', async (req, res) => {
  try {
    const { interventionNote, status } = req.body;
    const validStatuses = ['En cours', 'Résolu'];
    const newStatus = validStatuses.includes(status) ? status : 'Résolu';

    const reclamation = await Reclamation.findByIdAndUpdate(
      req.params.id,
      {
        status: newStatus,
        adminNote: interventionNote || '',
        updatedAt: new Date(),
      },
      { new: true }
    );
    if (!reclamation) return res.status(404).json({ message: 'Réclamation non trouvée' });
    res.json({ message: `Réclamation marquée comme: ${newStatus}`, reclamation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chef/accounts — List all chef accounts info (for admin reference, no passwords)
router.get('/accounts', async (req, res) => {
  try {
    const chefs = await Chef.find({}, '-password');
    res.json(chefs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
