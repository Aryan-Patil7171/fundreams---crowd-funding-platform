exports.h = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.fail = (res, code, message) => res.status(code).json({ success: false, message });
exports.ok = (res, data, code = 200) => res.status(code).json({ success: true, data });
