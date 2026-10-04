const mongoose = require('mongoose');
module.exports = mongoose.model('Tier', new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  reward: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  limit: { type: Number, default: 0, min: 0 },
  claimed: { type: Number, default: 0 },
  estimatedDelivery: Date,
}, { timestamps: true }));
