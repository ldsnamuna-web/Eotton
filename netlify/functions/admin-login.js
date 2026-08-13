// Энэ функц Netlify-н серверийн орчинд ажилладаг тул нууц үг, Firebase service account
// зэрэг мэдээлэл ХЭЗЭЭ Ч клиент код (браузер) руу гардаггүй.
const admin = require('firebase-admin');

let firebaseApp;
function getAdminApp() {
  if (!firebaseApp) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return firebaseApp;
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Буруу хүсэлт' }) };
  }

  const password = body.password || '';
  const expected = process.env.ADMIN_ACCESS_PASSWORD;

  if (!expected) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'ADMIN_ACCESS_PASSWORD Netlify environment variable тохируулагдаагүй байна.' }),
    };
  }

  if (password !== expected) {
    // Санаатайгаар бага зэрэг хойшлуулж, нууц үг таах оролдлогыг удаашруулна
    await new Promise((r) => setTimeout(r, 500));
    return { statusCode: 200, body: JSON.stringify({ ok: false }) };
  }

  try {
    getAdminApp();
    const uid = process.env.ADMIN_UID || 'site-admin';
    // Firestore-ийн admins/{uid} документ байгааг баталгаажуулна (Admin SDK нь Firestore
    // Security Rules-ийг тойрч бичих эрхтэй тул энэ нь rules-ыг зөрчихгүй)
    await admin
      .firestore()
      .collection('admins')
      .doc(uid)
      .set({ addedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

    const token = await admin.auth().createCustomToken(uid);
    return { statusCode: 200, body: JSON.stringify({ ok: true, token }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Серверийн алдаа: ' + e.message }) };
  }
};
