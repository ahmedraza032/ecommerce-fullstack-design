require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

const crypto = require('crypto');

// ── Init Firebase ──────────────────────────────────────────────────────────────
// Fix: Node.js v17+ openssl change breaks RSA PKCS#1 key parsing.
// We convert the private key to PKCS8 format that Node.js 21 accepts.
if (serviceAccount.private_key) {
  // Normalize escaped newlines to real newlines (common JSON serialization issue)
  const rawKey = serviceAccount.private_key.replace(/\\n/g, '\n');
  try {
    // Re-export as PKCS8 which Node.js 21 supports natively
    const keyObj = crypto.createPrivateKey(rawKey);
    serviceAccount.private_key = keyObj.export({ type: 'pkcs8', format: 'pem' }).toString();
  } catch {
    serviceAccount.private_key = rawKey;
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

// ── Sample Products ────────────────────────────────────────────────────────────
const sampleProducts = [
  // ── Electronics ───────────────────────────────────────────────────────────
  {
    name: 'Apple iPhone 15 Pro Max 256GB',
    price: 1199.00,
    oldPrice: 1399.00,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
    description: 'The latest iPhone with a titanium design, A17 Pro chip, and a 48MP main camera system. Features USB-C connectivity and Action button.',
    category: 'Electronics',
    stock: 45,
    rating: 9.5,
    featured: true,
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    price: 279.99,
    oldPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1657223945710-c8b58c3e8c6b?w=600&q=80',
    description: 'Industry-leading noise cancelling with 30-hour battery life, crystal clear hands-free calling and Alexa built-in.',
    category: 'Electronics',
    stock: 120,
    rating: 9.2,
    featured: true,
  },
  {
    name: 'Samsung 4K QLED Smart TV 55"',
    price: 799.00,
    oldPrice: 1099.00,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80',
    description: 'Quantum Dot technology delivers 100% Color Volume with stunning clarity. Smart TV with Alexa, Google Assistant and Bixby.',
    category: 'Electronics',
    stock: 28,
    rating: 8.8,
    featured: true,
  },
  {
    name: 'GoPro HERO12 Black Action Camera',
    price: 349.99,
    oldPrice: 449.99,
    image: 'https://images.unsplash.com/photo-1524143986875-3b098d78b363?w=600&q=80',
    description: 'Capture stunning 5.3K video and 27MP photos. HyperSmooth 6.0 video stabilization. Waterproof up to 33 feet.',
    category: 'Electronics',
    stock: 75,
    rating: 9.0,
    featured: false,
  },
  {
    name: 'MacBook Air 15" M3 Chip 512GB',
    price: 1299.00,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    description: 'Supercharged by M3 chip, the MacBook Air flies through everything you do. Up to 18 hours battery life with a 15.3-inch Liquid Retina display.',
    category: 'Electronics',
    stock: 33,
    rating: 9.7,
    featured: true,
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    price: 99.99,
    oldPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
    description: 'Crafted for speed, comfort and precision with MagSpeed electromagnetic scrolling. Works on any surface — even glass.',
    category: 'Electronics',
    stock: 200,
    rating: 9.1,
    featured: false,
  },

  // ── Clothing ───────────────────────────────────────────────────────────────
  {
    name: 'Premium Slim Fit Cotton T-Shirt',
    price: 29.99,
    oldPrice: 49.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    description: 'Ultra-soft 100% organic cotton. Classic crew neck with a modern slim fit. Available in 12 colors. Machine washable.',
    category: 'Clothing',
    stock: 500,
    rating: 8.5,
    featured: false,
  },
  {
    name: "Men's Classic Denim Jacket",
    price: 79.99,
    oldPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&q=80',
    description: 'Timeless denim jacket with a comfortable fit. Features button closure, chest pockets, and side pockets. Made with premium denim.',
    category: 'Clothing',
    stock: 150,
    rating: 8.7,
    featured: true,
  },
  {
    name: "Women's Casual Floral Summer Dress",
    price: 44.99,
    oldPrice: 69.99,
    image: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&q=80',
    description: 'Lightweight and breathable floral print dress perfect for summer. V-neck, midi length, with adjustable waist tie.',
    category: 'Clothing',
    stock: 220,
    rating: 8.9,
    featured: true,
  },
  {
    name: 'Brown Leather Wallet for Men',
    price: 39.99,
    oldPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
    description: 'Genuine leather bifold wallet with RFID blocking. 6 card slots, 2 bill compartments, and 1 zippered coin pocket.',
    category: 'Clothing',
    stock: 300,
    rating: 8.4,
    featured: false,
  },
  {
    name: 'Solid Backpack Blue Large 30L',
    price: 54.99,
    oldPrice: 84.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    description: '30L travel backpack with laptop compartment (fits up to 17"). Water-resistant nylon, padded straps, and multiple organizer pockets.',
    category: 'Clothing',
    stock: 185,
    rating: 8.6,
    featured: false,
  },

  // ── Home & Outdoor ─────────────────────────────────────────────────────────
  {
    name: 'Ergonomic Mesh Office Chair',
    price: 299.99,
    oldPrice: 449.99,
    image: 'https://images.unsplash.com/photo-1505797149-35ebfb5e5b11?w=600&q=80',
    description: 'Full mesh back for breathability, adjustable lumbar support, seat depth, and armrests. Supports up to 300 lbs. Perfect for long work sessions.',
    category: 'Home & Outdoor',
    stock: 60,
    rating: 9.0,
    featured: true,
  },
  {
    name: 'Ceramic Pour-Over Coffee Maker Set',
    price: 49.99,
    oldPrice: 74.99,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    description: 'Handcrafted ceramic dripper with stainless steel gooseneck kettle and glass server. Brews 1–4 cups. Elegant design for any kitchen.',
    category: 'Home & Outdoor',
    stock: 95,
    rating: 8.8,
    featured: false,
  },
  {
    name: 'Portable Blender USB Rechargeable',
    price: 34.99,
    oldPrice: 54.99,
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80',
    description: 'Blend smoothies, shakes, and juices anywhere. USB-C rechargeable, 6 sharp blades, BPA-free bottle (600ml), runs 20+ blends per charge.',
    category: 'Home & Outdoor',
    stock: 310,
    rating: 8.3,
    featured: false,
  },
  {
    name: 'Smart LED Floor Lamp — RGB',
    price: 89.99,
    oldPrice: 129.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
    description: 'Wi-Fi enabled RGB floor lamp with 16 million colors. App and voice control (Alexa/Google). Dimmable, 5 brightness levels, timer function.',
    category: 'Home & Outdoor',
    stock: 78,
    rating: 8.6,
    featured: true,
  },
  {
    name: 'Kitchen Stand Mixer 5.5 Qt',
    price: 249.99,
    oldPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    description: 'Powerful 575W motor with 10 speed settings. Includes flat beater, dough hook, and wire whip. Tilt-head design for easy bowl access.',
    category: 'Home & Outdoor',
    stock: 42,
    rating: 9.3,
    featured: true,
  },

  // ── Sports ─────────────────────────────────────────────────────────────────
  {
    name: 'Smart Fitness Tracker Watch',
    price: 149.99,
    oldPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80',
    description: 'Track heart rate, SpO2, sleep, and 20+ sports modes. 7-day battery life, GPS, water resistant to 50M. AMOLED display.',
    category: 'Sports',
    stock: 250,
    rating: 8.9,
    featured: true,
  },
  {
    name: 'Yoga Mat Non-Slip 6mm Thick',
    price: 29.99,
    oldPrice: 44.99,
    image: 'https://images.unsplash.com/photo-1601925228008-6a0f9a75b3c6?w=600&q=80',
    description: 'Eco-friendly TPE yoga mat with superior grip on both sides. 6mm thickness for joint cushioning. Comes with carrying strap.',
    category: 'Sports',
    stock: 400,
    rating: 8.7,
    featured: false,
  },
  {
    name: 'Adjustable Dumbbell Set 5–52.5 lbs',
    price: 349.99,
    oldPrice: 499.99,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    description: 'SelectTech dumbbell replaces 15 sets of weights. Easy turn-dial adjustment. Compact storage. Ideal for full-body home workouts.',
    category: 'Sports',
    stock: 55,
    rating: 9.4,
    featured: false,
  },

  // ── Accessories ────────────────────────────────────────────────────────────
  {
    name: 'Anker 65W USB-C Fast Charger',
    price: 35.99,
    oldPrice: 49.99,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
    description: 'Nano Pro 65W charger supports PD 3.0 for laptops, tablets, and smartphones. Foldable pins. Compatible with MacBook, iPhone, Samsung.',
    category: 'Accessories',
    stock: 500,
    rating: 9.0,
    featured: false,
  },
  {
    name: 'Polarized Aviator Sunglasses',
    price: 24.99,
    oldPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
    description: 'Classic aviator frame with polarized UV400 lenses. Lightweight metal frame. Reduces glare for driving and outdoor activities.',
    category: 'Accessories',
    stock: 600,
    rating: 8.2,
    featured: false,
  },
  {
    name: 'Wireless Charging Pad 15W',
    price: 19.99,
    oldPrice: 34.99,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
    description: 'Qi-certified 15W fast wireless charger compatible with iPhone, Samsung, and all Qi-enabled devices. LED indicator, overheat protection.',
    category: 'Accessories',
    stock: 350,
    rating: 8.5,
    featured: false,
  },
];

// ── Seed Function ──────────────────────────────────────────────────────────────
async function seedDatabase() {
  console.log('🌱 Starting database seed...');
  console.log(`📦 Firebase DB URL: ${process.env.FIREBASE_DATABASE_URL}`);

  try {
    const ref = db.ref('products');

    // Clear existing products
    console.log('🗑️  Clearing existing products...');
    await ref.remove();

    // Insert each product
    console.log(`➕ Inserting ${sampleProducts.length} products...`);
    const insertPromises = sampleProducts.map(async (product) => {
      const newRef = await ref.push({
        ...product,
        createdAt: Date.now(),
      });
      console.log(`  ✅ [${product.category}] ${product.name} → ${newRef.key}`);
      return newRef.key;
    });

    await Promise.all(insertPromises);

    console.log('\n🎉 Seed complete!');
    console.log(`   Total products: ${sampleProducts.length}`);
    const categories = [...new Set(sampleProducts.map(p => p.category))];
    console.log(`   Categories: ${categories.join(', ')}`);
    console.log(`   Featured: ${sampleProducts.filter(p => p.featured).length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
