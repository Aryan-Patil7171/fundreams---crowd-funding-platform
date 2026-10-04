const { fail } = require('../utils/helpers');
const clean = o => { if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (k.startsWith('$') || k.includes('.')) delete o[k]; else clean(o[k]); } };
exports.sanitize = (req, _res, next) => { clean(req.body); clean(req.query); next(); };
exports.require = (...f) => (req, res, next) => {
  const m = f.filter(k => req.body[k] === undefined || req.body[k] === '');
  return m.length ? fail(res, 400, 'Missing required field(s): ' + m.join(', ')) : next();
};
