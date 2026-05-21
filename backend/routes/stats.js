const express = require('express');
const router = express.Router();
const Reclamation = require('../models/Reclamation');
const Evaluation = require('../models/Evaluation');

// GET /api/stats — Dashboard statistics
router.get('/', async (req, res) => {
  try {
    const totalReclamations = await Reclamation.countDocuments();
    const resolvedReclamations = await Reclamation.countDocuments({ status: 'Résolu' });
    const inProgressReclamations = await Reclamation.countDocuments({ status: 'En cours' });
    const newReclamations = await Reclamation.countDocuments({ status: 'Nouveau' });

    // Today's counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayReclamations = await Reclamation.countDocuments({ createdAt: { $gte: today } });
    const todayResolved = await Reclamation.countDocuments({ status: 'Résolu', updatedAt: { $gte: today } });

    // By category
    const byCategory = await Reclamation.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Last 7 days daily counts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyData = await Reclamation.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const found = dailyData.find(x => x._id === key);
      days.push({ day: dayNames[d.getDay()], date: key, count: found ? found.count : 0 });
    }

    // Average satisfaction
    const avgEval = await Evaluation.aggregate([
      { $group: { _id: null, avg: { $avg: '$overall' } } }
    ]);
    const avgSatisfaction = avgEval[0] ? Math.round(avgEval[0].avg * 10) / 10 : 0;

    // Recent reclamations
    const recentReclamations = await Reclamation.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalReclamations,
      resolvedReclamations,
      inProgressReclamations,
      newReclamations,
      todayReclamations,
      todayResolved,
      resolutionRate: totalReclamations > 0 ? Math.round((resolvedReclamations / totalReclamations) * 100) : 0,
      byCategory,
      dailyData: days,
      avgSatisfaction,
      recentReclamations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
