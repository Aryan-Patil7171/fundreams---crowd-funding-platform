const mongoose = require('mongoose');
module.exports = mongoose.model('Update', new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true }, content: { type: String, required: true },
  type: { type: String, enum: ['general', 'stretch_goal', 'delivery'], default: 'general' },
}, { timestamps: true }));
