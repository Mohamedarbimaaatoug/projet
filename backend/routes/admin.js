const express = require('express');
const router = express.Router();

// Hardcoded admin credentials (in production, use DB + bcrypt)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'hotel2025',
  name: 'Administrateur',
  role: 'admin'
};

// Department chiefs mapping
const DEPARTMENT_CHIEFS = {
  'Climatisation':  { name: 'Chef Maintenance', email: 'maintenance@hotel-paradis.com', dept: 'Maintenance' },
  'Plomberie':      { name: 'Chef Maintenance', email: 'maintenance@hotel-paradis.com', dept: 'Maintenance' },
  'Électricité':    { name: 'Chef Maintenance', email: 'maintenance@hotel-paradis.com', dept: 'Maintenance' },
  'TV':             { name: 'Chef Maintenance', email: 'maintenance@hotel-paradis.com', dept: 'Maintenance' },
  'Wi-Fi':          { name: 'Chef Technique',   email: 'technique@hotel-paradis.com',   dept: 'Technique'   },
  'Ménage':         { name: 'Chef Ménage',      email: 'menage@hotel-paradis.com',       dept: 'Ménage'      },
  'Mini-bar':       { name: 'Chef Ménage',      email: 'menage@hotel-paradis.com',       dept: 'Ménage'      },
  'Restauration':   { name: 'Chef Restauration',email: 'resto@hotel-paradis.com',        dept: 'Restauration'},
  'Bruit':          { name: 'Chef Sécurité',    email: 'securite@hotel-paradis.com',     dept: 'Sécurité'    },
  'Autre':          { name: 'Directeur',         email: 'direction@hotel-paradis.com',    dept: 'Direction'   },
};

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Identifiants manquants' });

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return res.json({
      message: 'Connexion admin réussie',
      admin: { name: ADMIN_CREDENTIALS.name, role: ADMIN_CREDENTIALS.role, username }
    });
  }
  return res.status(401).json({ message: 'Identifiants incorrects' });
});

// GET /api/admin/departments — list all departments and chiefs
router.get('/departments', (req, res) => {
  res.json(DEPARTMENT_CHIEFS);
});

module.exports = router;
module.exports.DEPARTMENT_CHIEFS = DEPARTMENT_CHIEFS;
