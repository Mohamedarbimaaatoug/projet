require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/clients', require('./routes/clients'));
app.use('/api/reclamations', require('./routes/reclamations'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chef', require('./routes/chef'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connecté à:', process.env.MONGODB_URI);
    
    // Seed Chef accounts if they do not exist
    try {
      const Chef = require('./models/Chef');
      const chefCount = await Chef.countDocuments();
      if (chefCount === 0) {
        const CHEF_ACCOUNTS = [
          { username: 'maintenance', password: 'maint2025', name: 'Karim Bensalem', title: 'Chef Maintenance', dept: 'Maintenance', icon: '🔧', categories: ['Climatisation', 'Plomberie', 'Électricité', 'TV'] },
          { username: 'technique', password: 'tech2025', name: 'Sofiane Amari', title: 'Chef Technique', dept: 'Technique', icon: '📡', categories: ['Wi-Fi'] },
          { username: 'menage', password: 'menage2025', name: 'Fatima Zohra', title: 'Chef Ménage', dept: 'Ménage', icon: '🧹', categories: ['Ménage', 'Mini-bar'] },
          { username: 'restauration', password: 'resto2025', name: 'Hassan Mrabet', title: 'Chef Restauration', dept: 'Restauration', icon: '🍽️', categories: ['Restauration'] },
          { username: 'securite', password: 'secu2025', name: 'Mourad Hadj', title: 'Chef Sécurité', dept: 'Sécurité', icon: '🔒', categories: ['Bruit'] },
          { username: 'directeur', password: 'dir2025', name: 'Nadia Benali', title: 'Directrice', dept: 'Direction', icon: '🏢', categories: ['Autre'] }
        ];
        await Chef.insertMany(CHEF_ACCOUNTS);
        console.log('🌱 Comptes Chefs initialisés dans la base de données');
      }
    } catch (err) {
      console.error('❌ Erreur lors du seeding des chefs:', err.message);
    }

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err.message);
    process.exit(1);
  });

