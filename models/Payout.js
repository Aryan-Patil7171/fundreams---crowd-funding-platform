const mongoose = require('mongoose');
module.exports = mongoose.model('Payout', new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grossAmount: Number, feePercent: Number, feeAmount: Number, netAmount: Number,
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
}, { timestamps: true }));
