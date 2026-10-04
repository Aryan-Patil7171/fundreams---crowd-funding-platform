const mongoose = require('mongoose');
const s = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true },
  category: { type: String, default: 'general' },
  videoUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  goalAmount: { type: Number, required: true, min: 1 },
  raisedAmount: { type: Number, default: 0, min: 0 },
  backersCount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'active', 'funded', 'ended'], default: 'active' },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  stretchGoals: [{ amount: Number, title: String, unlocked: { type: Boolean, default: false } }],
}, { timestamps: true, toJSON: { virtuals: true } });
s.virtual('percentFunded').get(function () { return Math.round((this.raisedAmount / this.goalAmount) * 100); });
module.exports = mongoose.model('Campaign', s);
