const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  dept: { type: String, required: true },
  icon: { type: String },
  categories: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Chef', chefSchema);
