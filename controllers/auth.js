const jwt = require('jsonwebtoken'), User = require('../models/User'), { h, ok, fail } = require('../utils/helpers'), { verifyIdToken } = require('../utils/firebase');
const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
const out = u => ({ _id: u._id, name: u.name, email: u.email, role: u.role });
exports.register = h(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await User.findOne({ email })) return fail(res, 409, 'Email already registered');
  const u = await User.create({ name, email, password, role: role === 'creator' ? 'creator' : 'backer' });
  ok(res, { user: out(u), token: sign(u) }, 201);
});
exports.firebaseLogin = h(async (req, res) => {
  const { idToken, role } = req.body;
  if (!idToken) return fail(res, 400, 'Firebase ID token is required');
  const decoded = await verifyIdToken(idToken);
  const email = (decoded.email || '').toLowerCase();
  if (!email) return fail(res, 400, 'Firebase account must have an email');

  let u = await User.findOne({ $or: [{ firebaseUid: decoded.uid }, { email }] });
  if (!u) {
    u = await User.create({
      name: decoded.name || decoded.email.split('@')[0],
      email,
      firebaseUid: decoded.uid,
      authProvider: 'firebase',
      role: role === 'creator' ? 'creator' : 'backer'
    });
  } else {
    u.firebaseUid = decoded.uid;
    u.authProvider = 'firebase';
    if (decoded.name && !u.name) u.name = decoded.name;
    await u.save();
  }
  ok(res, { user: out(u), token: sign(u), firebase: { uid: decoded.uid, email } });
});
exports.login = h(async (req, res) => {
  const u = await User.findOne({ email: req.body.email }).select('+password');
  if (!u || !(await u.matches(req.body.password))) return fail(res, 401, 'Invalid credentials');
  ok(res, { user: out(u), token: sign(u) });
});
exports.me = (req, res) => ok(res, out(req.user));
exports.setFcmToken = h(async (req, res) => { req.user.fcmToken = req.body.token; await req.user.save(); ok(res, { saved: true }); });
