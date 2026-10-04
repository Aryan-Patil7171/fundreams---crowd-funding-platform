require('dotenv').config();
const mongoose = require('mongoose'), User = require('../models/User'), Campaign = require('../models/Campaign'), Tier = require('../models/Tier'), Pledge = require('../models/Pledge'), Update = require('../models/Update'), Payout = require('../models/Payout'), Notification = require('../models/Notification');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([User, Campaign, Tier, Pledge, Update, Payout, Notification].map(m => m.deleteMany({})));
  const [, creator, b1, b2] = await User.create([
    { name: 'Admin', email: 'admin@funddreams.com', password: 'Admin@123', role: 'admin' },
    { name: 'Asha Creator', email: 'creator@funddreams.com', password: 'Creator@123', role: 'creator', kycStatus: 'verified' },
    { name: 'Ravi Backer', email: 'backer@funddreams.com', password: 'Backer@123' },
    { name: 'Meera Backer', email: 'meera@funddreams.com', password: 'Backer@123' }]);
  const day = 864e5, mk = o => Campaign.create({ creator: creator._id, verificationStatus: 'verified', ...o });
  const game = await mk({ title: 'Kingdoms of Dust - Board Game', description: 'A strategic desert-empire board game.', category: 'games', videoUrl: 'https://youtu.be/dQw4w9WgXcQ', goalAmount: 500000, raisedAmount: 375000, backersCount: 2, deadline: new Date(Date.now() + 15 * day), stretchGoals: [{ amount: 400000, title: 'Metal coins' }, { amount: 600000, title: 'Extra expansion' }] });
  const film = await mk({ title: 'Monsoon - Indie Short Film', description: 'A short film shot across Kerala.', category: 'film', goalAmount: 200000, raisedAmount: 200000, backersCount: 1, status: 'funded', deadline: new Date(Date.now() - 2 * day) });
  await mk({ title: 'Pending Podcast Studio', description: 'Awaiting admin verification.', category: 'music', goalAmount: 100000, verificationStatus: 'pending', deadline: new Date(Date.now() + 30 * day) });
  const [std, dlx] = await Tier.create([
    { campaign: game._id, title: 'Standard', reward: 'Standard edition', amount: 1000, claimed: 1 },
    { campaign: game._id, title: 'Deluxe', reward: 'Deluxe edition + miniatures', amount: 2000, limit: 500, claimed: 1 }]);
  await Pledge.create([{ backer: b1._id, campaign: game._id, tier: dlx._id, amount: 2000 }, { backer: b2._id, campaign: game._id, tier: std._id, amount: 1000 }, { backer: b1._id, campaign: film._id, amount: 200000 }]);
  await Update.create({ campaign: game._id, author: creator._id, title: 'Prototype ready!', content: 'First production prototype is done.' });
  console.log('Seeded. admin@funddreams.com/Admin@123  creator@funddreams.com/Creator@123  backer@funddreams.com/Backer@123');
  await mongoose.disconnect();
})();
