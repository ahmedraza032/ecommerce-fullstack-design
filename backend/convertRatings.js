const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase
if (!admin.apps.length) {
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ecommerce-full-stack-74012-default-rtdb.firebaseio.com'
  });
}

const db = admin.database();

async function convertRatings() {
  const ref = db.ref('products');
  const snapshot = await ref.once('value');
  const products = snapshot.val();
  
  if (!products) {
    console.log('No products found');
    process.exit(0);
  }

  const updates = {};
  for (const [id, product] of Object.entries(products)) {
    if (product.rating !== undefined && product.rating > 5) {
      // It's out of 10, halve it
      updates[`${id}/rating`] = Number((product.rating / 2).toFixed(1));
    }
  }

  if (Object.keys(updates).length > 0) {
    await ref.update(updates);
    console.log(`Updated ${Object.keys(updates).length} products to 0-5 rating scale.`);
  } else {
    console.log('No products needed rating conversion.');
  }

  process.exit(0);
}

convertRatings();
