const r = require('express').Router(), { protect, authorize } = require('../middleware/auth'), { require: need } = require('../middleware/validate');
const crud = require('../controllers/crud'), A = require('../controllers/auth'), P = require('../controllers/pledges'), Y = require('../controllers/payouts'), N = require('../controllers/notifications'), AD = require('../controllers/admin');
const Campaign = require('../models/Campaign'), Tier = require('../models/Tier'), Update = require('../models/Update');
const { h, ok, fail } = require('../utils/helpers');
const cre = authorize('creator', 'admin');
const campOwner = async id => (await Campaign.findById(id))?.creator;
const mine = async (req, res) => req.user.role === 'admin' || String(await campOwner(req.body.campaign)) === String(req.user._id) || (fail(res, 403, 'Not your campaign'), false);

r.post('/auth/register', need('name', 'email', 'password'), A.register);
r.post('/auth/login', need('email', 'password'), A.login);
r.post('/auth/firebase', need('idToken'), A.firebaseLogin);
r.get('/auth/me', protect, A.me);
r.put('/auth/fcm-token', protect, need('token'), A.setFcmToken);

const C = crud(Campaign, { populate: { path: 'creator', select: 'name' }, ownerOf: d => d.creator,
  protectedFields: ['creator', 'raisedAmount', 'backersCount', 'verificationStatus'],
  filter: req => { const q = { verificationStatus: 'verified' }; if (req.query.category) q.category = req.query.category; if (req.query.q) q.title = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); return q; },
  prepare: req => ({ ...req.body, creator: req.user._id, verificationStatus: 'pending', raisedAmount: 0, backersCount: 0 }) });
r.get('/campaigns', C.list); r.get('/campaigns/:id', C.get);
r.post('/campaigns', protect, cre, need('title', 'description', 'goalAmount', 'deadline'), C.create);
r.put('/campaigns/:id', protect, cre, C.update); r.delete('/campaigns/:id', protect, cre, C.remove);

const T = crud(Tier, { ownerOf: d => campOwner(d.campaign), protectedFields: ['claimed', 'campaign'], filter: req => (req.query.campaign ? { campaign: req.query.campaign } : {}) });
r.get('/tiers', T.list); r.get('/tiers/:id', T.get);
r.post('/tiers', protect, cre, need('campaign', 'title', 'reward', 'amount'), h(async (req, res, next) => { if (await mine(req, res)) T.create(req, res, next); }));
r.put('/tiers/:id', protect, cre, T.update); r.delete('/tiers/:id', protect, cre, T.remove);

r.post('/pledges', protect, need('campaign'), P.create);
r.get('/pledges', protect, P.mine);
r.get('/pledges/campaign/:id', protect, cre, P.byCampaign);

r.post('/updates', protect, cre, need('campaign', 'title', 'content'), h(async (req, res) => {
  if (!(await mine(req, res))) return;
  const u = await Update.create({ ...req.body, author: req.user._id });
  req.app.get('io').to('campaign:' + req.body.campaign).emit('campaign:update', u);
  N.notifyBackers(req.body.campaign, u.title, u.content.slice(0, 120)).catch(console.error);
  ok(res, u, 201);
}));
r.get('/updates', h(async (_q, res) => ok(res, await Update.find().populate('campaign', 'title').sort('-createdAt').limit(100))));
r.get('/updates/campaign/:id', h(async (req, res) => ok(res, await Update.find({ campaign: req.params.id }).sort('-createdAt'))));

r.post('/payouts', protect, cre, need('campaign'), Y.create);
r.get('/payouts', protect, Y.list);
r.get('/payouts/campaign/:id', protect, Y.byCampaign);

r.get('/admin/campaigns', protect, authorize('admin'), AD.campaigns);
r.put('/admin/verify/:id', protect, authorize('admin'), AD.verify);

r.post('/notifications/send', protect, cre, need('campaign', 'title', 'body'), N.send);
r.get('/notifications', protect, N.mine);
module.exports = r;
