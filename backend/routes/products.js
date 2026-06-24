const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads using memory storage (for Vercel serverless compatibility)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Helper to get the products DB reference
const getRef = () => admin.database().ref('products');

// ── Helper: snapshot → array ───────────────────────────────────────────────────
function snapshotToArray(snapshot) {
  const result = [];
  snapshot.forEach((child) => {
    result.push({ id: child.key, ...child.val() });
  });
  return result;
}

// ── Middleware: Authenticate Admin ─────────────────────────────────────────────
async function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    if (decodedToken.email !== adminEmail) {
      return res.status(403).json({ success: false, error: 'Forbidden: Admin privileges required' });
    }
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Verify ID token error:', err);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
}

// ── POST /api/products/upload ──────────────────────────────────────────────────
router.post('/upload', authenticateAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    // Convert buffer to Base64 Data URL to bypass Vercel serverless read-only filesystem
    const base64Image = req.file.buffer.toString('base64');
    const fileUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error('POST /upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/products/featured ─────────────────────────────────────────────────
// Must be defined BEFORE /:id so the route isn't captured as an id
router.get('/featured', async (req, res) => {
  try {
    const snapshot = await getRef().orderByChild('featured').equalTo(true).once('value');
    const products = snapshotToArray(snapshot);
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error('GET /featured error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/products ──────────────────────────────────────────────────────────
// Supports: ?search=<query>  ?category=<cat>
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let snapshot;

    // Filter by category using Firebase index if present
    if (category) {
      snapshot = await getRef().orderByChild('category').equalTo(category).once('value');
    } else {
      snapshot = await getRef().once('value');
    }

    let products = snapshotToArray(snapshot);

    // Filter by search term (name or category) — done in-memory
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/products/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const snapshot = await getRef().child(req.params.id).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const product = { id: snapshot.key, ...snapshot.val() };
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('GET /:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/products ─────────────────────────────────────────────────────────
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, price, image, description, category, stock, featured, oldPrice, rating } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, error: 'name, price, and category are required' });
    }

    const newProduct = {
      name,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      image: image || '',
      description: description || '',
      category,
      stock: stock !== undefined ? Number(stock) : 0,
      rating: rating ? Number(rating) : 0,
      featured: featured === true || featured === 'true',
      createdAt: Date.now(),
    };

    const ref = await getRef().push(newProduct);
    res.status(201).json({ success: true, data: { id: ref.key, ...newProduct } });
  } catch (err) {
    console.error('POST /products error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /api/products/:id ──────────────────────────────────────────────────────
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const snapshot = await getRef().child(req.params.id).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const updates = { ...req.body, updatedAt: Date.now() };
    // Coerce types
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.oldPrice !== undefined) updates.oldPrice = updates.oldPrice ? Number(updates.oldPrice) : null;
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.rating !== undefined) updates.rating = Number(updates.rating);
    if (updates.featured !== undefined) updates.featured = updates.featured === true || updates.featured === 'true';

    await getRef().child(req.params.id).update(updates);
    const updated = await getRef().child(req.params.id).once('value');
    res.json({ success: true, data: { id: updated.key, ...updated.val() } });
  } catch (err) {
    console.error('PUT /:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/products/:id ───────────────────────────────────────────────────
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const snapshot = await getRef().child(req.params.id).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    await getRef().child(req.params.id).remove();
    res.json({ success: true, message: `Product ${req.params.id} deleted successfully` });
  } catch (err) {
    console.error('DELETE /:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
