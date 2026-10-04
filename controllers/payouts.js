const Payout = require('../models/Payout'), Campaign = require('../models/Campaign'), { h, ok, fail } = require('../utils/helpers');
exports.create = h(async (req, res) => {
  const c = await Campaign.findById(req.body.campaign); if (!c) return fail(res, 404, 'Campaign not found');
  if (req.user.role !== 'admin' && String(c.creator) !== String(req.user._id)) return fail(res, 403, 'Not your campaign');
  if (c.raisedAmount < c.goalAmount) return fail(res, 400, 'Funding goal not met');
  if (c.deadline > new Date() && req.user.role !== 'admin') return fail(res, 400, 'Campaign still running');
  const paid = (await Payout.find({ campaign: c._id })).reduce((s, p) => s + p.grossAmount, 0);
  const gross = c.raisedAmount - paid; if (gross <= 0) return fail(res, 400, 'Nothing left to pay out');
  const pct = Number(process.env.PLATFORM_FEE_PERCENT || 8), fee = +(gross * pct / 100).toFixed(2);
  ok(res, await Payout.create({ campaign: c._id, creator: c.creator, grossAmount: gross, feePercent: pct, feeAmount: fee, netAmount: gross - fee, status: 'paid' }), 201);
});
exports.list = h(async (req, res) => ok(res, await Payout.find(req.user.role === 'admin' ? {} : { creator: req.user._id }).populate('campaign', 'title').sort('-createdAt')));
exports.byCampaign = h(async (req, res) => {
  const q = { campaign: req.params.id }; if (req.user.role !== 'admin') q.creator = req.user._id;
  ok(res, await Payout.find(q).sort('-createdAt'));
});
