const mongoose = require('mongoose'), R = (ref, req) => ({ type: mongoose.Schema.Types.ObjectId, ref, required: req });
module.exports = mongoose.model('Pledge', new mongoose.Schema({
  backer: R('User', true), campaign: R('Campaign', true), tier: R('Tier', false),
  amount: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['confirmed', 'refunded'], default: 'confirmed' },
}, { timestamps: true }));
