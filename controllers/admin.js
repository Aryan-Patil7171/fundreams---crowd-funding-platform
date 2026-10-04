const Campaign = require('../models/Campaign'), { h, ok, fail } = require('../utils/helpers');
exports.campaigns = h(async (req, res) => ok(res, await Campaign.find(req.query.status ? { verificationStatus: req.query.status } : {}).populate('creator', 'name email').sort('-createdAt')));
exports.verify = h(async (req, res) => {
  const c = await Campaign.findByIdAndUpdate(req.params.id, { verificationStatus: req.body.approve === false ? 'rejected' : 'verified' }, { new: true });
  c ? ok(res, c) : fail(res, 404, 'Campaign not found');
});
