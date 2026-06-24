require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// ── Firebase Admin Initialization ──────────────────────────────────────────────
// Normalize escaped newlines in the private key (common issue with JSON-loaded keys)
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Make DB reference accessible across modules
const db = admin.database();
module.exports.db = db;

// ── Express App ────────────────────────────────────────────────────────────────
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

// Serve uploaded images statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'E-Commerce API is running 🚀',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      featured: '/api/products/featured',
      search: '/api/products?search=<query>',
      category: '/api/products?category=<category>',
      single: '/api/products/:id',
    },
  });
});

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ── Start Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📦 Firebase Realtime DB: ${process.env.FIREBASE_DATABASE_URL}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
