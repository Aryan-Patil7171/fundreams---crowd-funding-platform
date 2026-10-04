const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
  password: { type: String, minlength: 6, select: false },
  firebaseUid: { type: String, unique: true, sparse: true, index: true },
  authProvider: { type: String, enum: ['local', 'firebase'], default: 'local' },
  role: { type: String, enum: ['backer', 'creator', 'admin'], default: 'backer' },
  kycStatus: { type: String, enum: ['none', 'pending', 'verified'], default: 'none' },
  fcmToken: { type: String, default: '' },
}, { timestamps: true });
s.pre('save', async function (n) { if (this.isModified('password') && this.password) this.password = await bcrypt.hash(this.password, 10); n(); });
s.methods.matches = function (p) { return this.password ? bcrypt.compare(p, this.password) : false; };
module.exports = mongoose.model('User', s);
