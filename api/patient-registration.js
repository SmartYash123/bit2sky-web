const admin = require('firebase-admin');

// Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, phone, smsOptIn } = req.body;

  if (!firstName || !email) {
    return res.status(400).json({ error: 'First name and email are required.' });
  }

  try {
    await db.collection('patient-registrations').add({
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      phone: phone || '',
      smsOptIn: smsOptIn || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'bit2sky-website'
    });

    return res.status(200).json({
      success: true,
      message: 'Registration submitted successfully!'
    });
  } catch (error) {
    console.error('Firebase error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};
