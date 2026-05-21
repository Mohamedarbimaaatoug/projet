const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Blocked emails/rooms reserved for admin
const ADMIN_RESERVED = ['admin@hotel-paradis.com'];
const ADMIN_ROOMS    = ['ADMIN', 'admin'];

// POST /api/clients/login — Client WiFi login / register
router.post('/login', async (req, res) => {
  try {
    const { name, email, phone, roomNumber } = req.body;
    if (!name || !email || !phone || !roomNumber) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    // Block admin-reserved credentials from client portal
    if (ADMIN_RESERVED.includes(email.toLowerCase()) || ADMIN_ROOMS.includes(roomNumber.toUpperCase())) {
      return res.status(403).json({ message: 'Accès non autorisé via le portail client' });
    }

    // Find or update existing client
    let client = await Client.findOneAndUpdate(
      { email, roomNumber },
      { name, email, phone, roomNumber },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Connexion réussie', client });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/clients - List all real clients (admin) — exclude admin accounts
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = {
      // Exclude any leftover admin dummy accounts
      email:      { $nin: ADMIN_RESERVED },
      roomNumber: { $nin: ADMIN_ROOMS },
    };
    if (search) {
      query.$or = [
        { name:       { $regex: search, $options: 'i' } },
        { email:      { $regex: search, $options: 'i' } },
        { phone:      { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } },
      ];
    }
    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/clients/cleanup — Remove leftover admin dummy accounts
router.delete('/cleanup', async (req, res) => {
  try {
    const result = await Client.deleteMany({
      $or: [
        { email: { $in: ADMIN_RESERVED } },
        { roomNumber: { $in: ADMIN_ROOMS } },
      ]
    });
    res.json({ message: `${result.deletedCount} compte(s) admin supprimé(s)` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
