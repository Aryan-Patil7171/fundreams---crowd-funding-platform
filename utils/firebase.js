const path = require('path');
let admin = null;

function initFirebase() {
  if (admin) return admin;
  if (!process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.log('Firebase not configured: Auth verification and push notifications are disabled');
    return null;
  }

  try {
    admin = require('firebase-admin');
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
    } else {
      credential = admin.credential.cert(require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT)));
    }
    if (!admin.apps.length) admin.initializeApp({ credential });
    console.log('Firebase Admin initialised');
    return admin;
  } catch (e) {
    console.warn('Firebase init failed:', e.message);
    admin = null;
    return null;
  }
}

initFirebase();

exports.isConfigured = () => Boolean(admin);
exports.verifyIdToken = async idToken => {
  if (!admin) throw Object.assign(new Error('Firebase Auth is not configured on the server'), { status: 503 });
  return admin.auth().verifyIdToken(idToken);
};
exports.push = async (tokens = [], title, body) => {
  if (!admin || !tokens.length) return 0;
  const r = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body }
  });
  return r.successCount;
};
