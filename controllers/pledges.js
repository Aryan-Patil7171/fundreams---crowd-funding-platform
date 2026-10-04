const Pledge = require('../models/Pledge'), Campaign = require('../models/Campaign'), Tier = require('../models/Tier'), { h, ok, fail } = require('../utils/helpers');
exports.create = h(async (req, res) => {
  const { campaign: cid, tier: tid } = req.body; let amount = Number(req.body.amount);
  const c = await Campaign.findById(cid);
  if (!c) return fail(res, 404, 'Campaign not found');
  if (c.verificationStatus !== 'verified' || !['active', 'funded'].includes(c.status) || c.deadline < new Date()) return fail(res, 400, 'Campaign is not open for pledges');
  if (String(c.creator) === String(req.user._id)) return fail(res, 400, 'Creators cannot back their own campaign');
  if (tid) {
    const t = await Tier.findOneAndUpdate({ _id: tid, campaign: cid, $expr: { $or: [{ $eq: ['$limit', 0] }, { $lt: ['$claimed', '$limit'] }] } }, { $inc: { claimed: 1 } });
    if (!t) return fail(res, 400, 'Tier unavailable or sold out');
    amount = Math.max(amount || 0, t.amount);
  }
  if (!(amount > 0)) return fail(res, 400, 'amount must be > 0');
  const pledge = await Pledge.create({ backer: req.user._id, campaign: cid, tier: tid || undefined, amount });
  const first = (await Pledge.countDocuments({ campaign: cid, backer: req.user._id })) === 1;
  const u = await Campaign.findByIdAndUpdate(cid, { $inc: { raisedAmount: amount, backersCount: first ? 1 : 0 } }, { new: true });
  u.stretchGoals.forEach(g => { if (!g.unlocked && u.raisedAmount >= g.amount) g.unlocked = true; });
  if (u.raisedAmount >= u.goalAmount && u.status === 'active') u.status = 'funded';
  await u.save();
  const progress = { campaignId: cid, raisedAmount: u.raisedAmount, goalAmount: u.goalAmount, percentFunded: u.percentFunded, backersCount: u.backersCount, status: u.status, stretchGoals: u.stretchGoals };
  req.app.get('io').to('campaign:' + cid).emit('funding:progress', progress);
  ok(res, { pledge, progress }, 201);
});
exports.mine = h(async (req, res) => ok(res, await Pledge.find(req.user.role === 'admin' ? {} : { backer: req.user._id }).populate('campaign', 'title').populate('tier', 'title reward').sort('-createdAt')));
exports.byCampaign = h(async (req, res) => {
  const c = await Campaign.findById(req.params.id); if (!c) return fail(res, 404, 'Campaign not found');
  if (req.user.role !== 'admin' && String(c.creator) !== String(req.user._id)) return fail(res, 403, 'Only the creator can view campaign pledges');
  ok(res, await Pledge.find({ campaign: c._id }).populate('backer', 'name email').populate('tier', 'title').sort('-createdAt'));
});
