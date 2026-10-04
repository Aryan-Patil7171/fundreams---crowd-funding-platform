require('dotenv').config();
const express = require('express'), http = require('http'), cors = require('cors'), helmet = require('helmet'), rate = require('express-rate-limit');
const { Server } = require('socket.io'), connect = require('./config/db'), { sanitize } = require('./middleware/validate');
const swaggerUi = require('swagger-ui-express'), swaggerDocument = require('./docs/openapi');
const app = express(), server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL, credentials: true } });
app.set('io', io);
io.on('connection', s => {
  s.on('join:campaign', id => s.join('campaign:' + id));
  s.on('leave:campaign', id => s.leave('campaign:' + id));
});
app.use(helmet(), cors({ origin: process.env.CLIENT_URL, credentials: true }), express.json({ limit: '1mb' }), sanitize);
app.use('/api/auth', rate({ windowMs: 15 * 60 * 1000, max: 100 }));
app.get('/api/health', (_q, r) => r.json({ success: true, status: 'ok' }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.use('/api', require('./routes'));
app.use((_q, r) => r.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, _q, res, _n) => {
  let code = err.status || 500, msg = err.message;
  if (err.name === 'ValidationError') { code = 400; msg = Object.values(err.errors).map(e => e.message).join(', '); }
  else if (err.name === 'CastError') { code = 400; msg = 'Invalid id'; }
  else if (err.code === 11000) { code = 409; msg = 'Duplicate value'; }
  if (code === 500) console.error(err);
  res.status(code).json({ success: false, message: code === 500 ? 'Server error' : msg });
});
connect().then(() => server.listen(process.env.PORT || 5000, () => console.log('API on :' + (process.env.PORT || 5000)))).catch(e => { console.error('DB connection failed:', e.message); process.exit(1); });
