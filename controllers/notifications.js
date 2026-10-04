const Notification = require('../models/Notification'), Pledge = require('../models/Pledge'), Campaign = require('../models/Campaign'), User = require('../models/User'), fb = require('../utils/firebase'), { h, ok, fail } = require('../utils/helpers');
exports.notifyBackers = async (campaignId, title, body) => {
  const ids = await Pledge.distinct('backer', { campaign: campaignId });
  if (ids.length) await Notification.insertMany(ids.map(user => ({ user, campaign: campaignId, title, body })));
  const tokens = (await User.find({ _id: { $in: ids }, fcmToken: { $ne: '' } }).select('fcmToken')).map(u => u.fcmToken);
  return { recipients: ids.length, pushed: await fb.push(tokens, title, body).catch(() => 0) };
};
exports.send = h(async (req, res) => {
  const c = await Campaign.findById(req.body.campaign); if (!c) return fail(res, 404, 'Campaign not found');
  if (req.user.role !== 'admin' && String(c.creator) !== String(req.user._id)) return fail(res, 403, 'Not your campaign');
  ok(res, await exports.notifyBackers(c._id, req.body.title, req.body.body), 201);
});
exports.mine = h(async (req, res) => ok(res, await Notification.find({ user: req.user._id }).sort('-createdAt').limit(100)));
