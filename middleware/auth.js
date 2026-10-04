const jwt = require('jsonwebtoken'), User = require('../models/User'), { fail, h } = require('../utils/helpers');
exports.protect = h(async (req, res, next) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  if (!t) return fail(res, 401, 'Not authenticated');
  let id; try { id = jwt.verify(t, process.env.JWT_SECRET).id; } catch { return fail(res, 401, 'Invalid or expired token'); }
  req.user = await User.findById(id);
  if (!req.user) return fail(res, 401, 'User no longer exists');
  next();
});
exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : fail(res, 403, 'Forbidden for role: ' + req.user.role);
