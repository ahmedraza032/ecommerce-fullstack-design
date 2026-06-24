import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSearch, FaTools, FaPlane, FaGlobe, FaChevronRight,
  FaShoppingCart, FaUser, FaBars, FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import { getProducts, getFeaturedProducts } from '../services/api';
import ProductImage from '../components/ProductImage';
import './Home.css';

// ── Countdown Timer ───────────────────────────────────────────────────────────
function useCountdown(hours = 4) {
  const end = Date.now() + hours * 3600 * 1000;
  const calc = () => {
    const d = Math.max(0, end - Date.now());
    return {
      days:  Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      mins:  Math.floor((d % 3600000) / 60000),
      secs:  Math.floor((d % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return t;
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function ProductSkeleton({ count = 5, type = 'deal' }) {
  return Array(count).fill(null).map((_, i) => (
    <div key={i} className={type === 'deal' ? 'deal-card skeleton-card' : 'cat-product-card skeleton-card'}>
      <div className="skeleton-img" />
      <div className="skeleton-line short" />
      <div className="skeleton-line tiny" />
    </div>
  ));
}

function RecommendedSkeleton({ count = 10 }) {
  return Array(count).fill(null).map((_, i) => (
    <div key={i} className="recommended-card card skeleton-card">
      <div className="skeleton-img" />
      <div style={{ padding: '0.5rem' }}>
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
      </div>
    </div>
  ));
}

// ── Static Data ───────────────────────────────────────────────────────────────
const sidebarCategories = [
  'Electronics', 'Clothing', 'Home & Outdoor',
  'Sports', 'Accessories', 'Automobiles', 'Tools & Equipment',
  'Animal and Pets', 'More categories',
];

const services = [
  { icon: <FaSearch />,  title: 'Source from Industry Hubs' },
  { icon: <FaTools />,   title: 'Customize Your Products' },
  { icon: <FaPlane />,   title: 'Fast, reliable shipping by ocean or air' },
  { icon: <FaGlobe />,   title: 'Product monitoring and inspection' },
];

const serviceImages = [
  '/services/industry-hubs.png',       // Source from Industry Hubs
  '/services/customize-products.png',  // Customize Your Products
  '/services/shipping.png',            // Fast, reliable shipping
  '/services/inspection.png',          // Product monitoring and inspection
];

const suppliers = [
  { flag: '🇦🇪', country: 'Arabic Emirates', domain: 'shopname.ae'    },
  { flag: '🇦🇺', country: 'Australia',       domain: 'shopname.com.au' },
  { flag: '🇺🇸', country: 'United States',   domain: 'shopname.us'    },
  { flag: '🇷🇺', country: 'Russia',          domain: 'shopname.ru'    },
  { flag: '🇮🇹', country: 'Italy',           domain: 'shopname.it'    },
  { flag: '🇩🇰', country: 'Denmark',         domain: 'denmark.com.dk' },
  { flag: '🇫🇷', country: 'France',          domain: 'shopname.com.fr' },
  { flag: '🇨🇳', country: 'China',           domain: 'shopname.cn'    },
  { flag: '🇬🇧', country: 'Great Britain',   domain: 'shopname.co.uk' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const timer = useCountdown(4);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [electronics, setElectronics] = useState([]);
  const [homeProducts, setHomeProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [featuredRes, electronicRes, homeRes, allRes] = await Promise.all([
          getFeaturedProducts(),
          getProducts({ category: 'Electronics' }),
          getProducts({ category: 'Home & Outdoor' }),
          getProducts(),
        ]);

        setFeaturedProducts(featuredRes.data || []);
        setElectronics((electronicRes.data || []).slice(0, 8));
        setHomeProducts((homeRes.data || []).slice(0, 8));
        setRecommended((allRes.data || []).slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        setError('Unable to load products. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const ErrorBanner = () => (
    <div className="api-error-banner">
      <FaExclamationTriangle />
      <span>{error}</span>
    </div>
  );

  return (
    <div className="home-page">

      {/* ── MOBILE SEARCH ────────────────────────────────────── */}
      <div className="mobile-search-bar">
        <form className="mobile-search-inner" onSubmit={handleSearch}>
          <FaSearch size={13} color="#8b96a5" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* ── MOBILE CATEGORY PILLS ────────────────────────────── */}
      <div className="mobile-category-pills">
        {['All', 'Electronics', 'Clothing', 'Home', 'Sports', 'Accessories'].map((cat, i) => (
          <span
            key={cat}
            className={`home-pill ${i === 0 ? 'active' : ''}`}
            onClick={() => navigate(i === 0 ? '/products' : `/products?category=${cat}`)}
          >
            {cat}
          </span>
        ))}
      </div>

      {error && <div className="container"><ErrorBanner /></div>}

      <section className="hero-section">
        <div className="container hero-grid">

          {/* Left sidebar */}
          <aside className="hero-sidebar card">
            <ul>
              {sidebarCategories.map((cat, i) => (
                <li key={i} className={i === 0 ? 'active' : ''}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`}>{cat}</Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Hero banner */}
          <div className="hero-banner">
            <div className="banner-content">
              <p className="banner-sub">Latest trending</p>
              <h1 className="banner-title">Electronic<br/>items</h1>
              <Link to="/products?category=Electronics" className="btn btn-outline learn-more-btn">Learn more</Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80"
              alt="Featured Electronics"
              className="banner-img"
            />
          </div>

          {/* Right user panel */}
          <aside className="hero-right">
            <div className="card user-panel">
              <div className="user-avatar">
                <img src="https://ui-avatars.com/api/?name=User&background=0D6EFD&color=fff" alt="User" />
                <span>Hi, user<br/><strong>let's get started</strong></span>
              </div>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Join now</Link>
              <Link to="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>Log in</Link>
            </div>
            <div className="promo-orange card">Get US $10 off<br/>with a new supplier</div>
            <div className="promo-teal card">Send quotes with<br/>supplier preferences</div>
          </aside>
        </div>
      </section>

      {/* ── DEALS & OFFERS ────────────────────────────────────────── */}
      <section className="section-wrap">
        <div className="container">
          <div className="deals-grid card">
            {/* Timer panel */}
            <div className="deals-timer-panel">
              <div>
                <h3>Deals and offers</h3>
                <p className="timer-sub">Exclusive discounts</p>
              </div>
              <div className="countdown">
                {[{ v: timer.days, l: 'Days' }, { v: timer.hours, l: 'Hour' }, { v: timer.mins, l: 'Min' }, { v: timer.secs, l: 'Sec' }].map(({ v, l }) => (
                  <div className="countdown-block" key={l}>
                    <span className="countdown-val">{String(v).padStart(2, '0')}</span>
                    <span className="countdown-label">{l}</span>
                  </div>
                ))}
              </div>
              <div className="mobile-source-link">Source now <FaChevronRight size={12}/></div>
            </div>

            {/* Deal Products */}
            <div className="deals-products">
              {loading ? (
                <ProductSkeleton count={5} type="deal" />
              ) : featuredProducts.slice(0, 5).map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="deal-card">
                  <div className="deal-img-wrap">
                    <ProductImage src={p.image} alt={p.name} />
                  </div>
                  <p className="deal-name">{p.name}</p>
                  {p.oldPrice && (
                    <span className="deal-discount">
                      -{Math.round((1 - p.price / p.oldPrice) * 100)}%
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOME AND OUTDOOR ──────────────────────────────────────── */}
      <section className="section-wrap">
        <div className="container">
          <div className="category-section card">
            <div className="category-banner" style={{ background: 'linear-gradient(160deg, #fffbe6 0%, #fff3cd 100%)' }}>
              <div>
                <h3>Home and<br/>outdoor</h3>
                <Link to="/products?category=Home+%26+Outdoor" className="btn btn-outline source-btn">Source now</Link>
              </div>
              <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80" alt="Home outdoor" className="cat-banner-img" />
            </div>
            <div className="category-products-grid">
              {loading ? (
                <ProductSkeleton count={8} type="cat" />
              ) : homeProducts.map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="cat-product-card">
                  <div className="cat-product-img">
                    <ProductImage src={p.image} alt={p.name} />
                  </div>
                  <p className="cat-prod-name">{p.name}</p>
                  <p className="cat-prod-sub">From USD {p.price.toFixed(0)}</p>
                </Link>
              ))}
            </div>
            <div className="mobile-source-link">Source now <FaChevronRight size={12}/></div>
          </div>
        </div>
      </section>

      {/* ── CONSUMER ELECTRONICS ──────────────────────────────────── */}
      <section className="section-wrap">
        <div className="container">
          <div className="category-section card">
            <div className="category-banner" style={{ background: 'linear-gradient(160deg, #fff0f6 0%, #ffe3ef 100%)' }}>
              <div>
                <h3>Consumer<br/>electronics<br/>and gadgets</h3>
                <Link to="/products?category=Electronics" className="btn btn-outline source-btn">Source now</Link>
              </div>
              <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80" alt="Electronics" className="cat-banner-img" />
            </div>
            <div className="category-products-grid">
              {loading ? (
                <ProductSkeleton count={8} type="cat" />
              ) : electronics.map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="cat-product-card">
                  <div className="cat-product-img">
                    <ProductImage src={p.image} alt={p.name} />
                  </div>
                  <p className="cat-prod-name">{p.name}</p>
                  <p className="cat-prod-sub">From USD {p.price.toFixed(0)}</p>
                </Link>
              ))}
            </div>
            <div className="mobile-source-link">Source now <FaChevronRight size={12}/></div>
          </div>
        </div>
      </section>

      {/* ── SUPPLIER REQUEST BANNER ───────────────────────────────── */}
      <section className="section-wrap">
        <div className="container">
          <div className="supplier-banner card">
            <div className="supplier-banner-left">
              <h2>An easy way to send<br/>requests to all suppliers</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
              <button className="btn btn-primary mobile-only-btn">Send inquiry</button>
            </div>
            <div className="supplier-banner-right card">
              <h4>Send quote to suppliers</h4>
              <p className="form-label">What item you need?</p>
              <input type="text" className="input-field" placeholder="Type more details" style={{ marginBottom: '1rem' }} />
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <p className="form-label">Quantity</p>
                  <input type="number" className="input-field" placeholder="0" />
                </div>
                <div style={{ width: '100px' }}>
                  <p className="form-label">&nbsp;</p>
                  <select className="input-field">
                    <option>Pcs</option><option>Kg</option><option>Box</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }}>Send inquiry</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECOMMENDED ITEMS ─────────────────────────────────────── */}
      <section className="section-wrap">
        <div className="container">
          <h2 className="section-title">Recommended items</h2>
          <div className="recommended-grid">
            {loading ? (
              <RecommendedSkeleton count={10} />
            ) : recommended.map(p => (
              <Link to={`/product/${p.id}`} key={p.id} className="recommended-card card">
                <div className="recommended-img-wrap">
                  <ProductImage src={p.image} alt={p.name} />
                </div>
                <div className="recommended-info">
                  <p className="recommended-price">${p.price.toFixed(2)}</p>
                  <p className="recommended-name">{p.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR EXTRA SERVICES ────────────────────────────────────── */}
      <section className="section-wrap">
        <div className="container">
          <h2 className="section-title">Our extra services</h2>
          <div className="services-grid">
            {services.map((s, i) => (
              <div key={i} className="service-card card">
                <div className="service-img-wrap">
                  <img
                    src={serviceImages[i]}
                    alt={s.title}
                    onError={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="service-overlay">
                    <span className="service-icon">{s.icon}</span>
                  </div>
                </div>
                <p className="service-title">{s.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── SUPPLIERS BY REGION ───────────────────────────────────── */}
      <section className="section-wrap">
        <div className="container">
          <div className="card suppliers-section">
            <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>Suppliers by region</h2>
            <div className="suppliers-grid">
              {suppliers.map((s, i) => (
                <div key={i} className="supplier-item">
                  <span className="supplier-flag">{s.flag}</span>
                  <div>
                    <p className="supplier-country">{s.country}</p>
                    <p className="supplier-domain">{s.domain}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────── */}
      <section className="newsletter-section">
        <div className="container newsletter-inner">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Subscribe on our newsletter</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Get daily news on upcoming offers from many suppliers all over the world
            </p>
            <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
              <input type="email" className="input-field newsletter-input" placeholder="✉  Email" />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
