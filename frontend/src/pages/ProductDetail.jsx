import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FaCheck, FaStar, FaRegStar, FaCommentDots,
  FaShoppingBasket, FaShieldAlt, FaGlobeAmericas, FaRegHeart,
  FaArrowLeft, FaShoppingCart, FaSpinner, FaExclamationTriangle,
  FaMinus, FaPlus
} from 'react-icons/fa';
import { getProductById, getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

function Stars({ rating = 0 }) {
  const full = Math.round((rating / 10) * 5);
  return (
    <div className="rating-stars" style={{ color: '#ff9017' }}>
      {[...Array(5)].map((_, i) =>
        i < full ? <FaStar key={i} /> : <FaRegStar key={i} />
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="product-main-card" style={{ gap: '1.5rem' }}>
      <div style={{ width: 340 }}>
        <div style={{ height: 340, background: '#e2e8f0', borderRadius: 8, animation: 'pd-shimmer 1.4s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#e2e8f0 25%,#f7fafc 50%,#e2e8f0 75%)' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[200, 120, 80, 160, 100].map((w, i) => (
          <div key={i} style={{ height: i === 0 ? 28 : 16, width: `${w}px`, borderRadius: 4, animation: 'pd-shimmer 1.4s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#e2e8f0 25%,#f7fafc 50%,#e2e8f0 75%)' }} />
        ))}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const [product, setProduct]         = useState(null);
  const [related, setRelated]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeTab, setActiveTab]     = useState('Description');
  const [activeImage, setActiveImage] = useState('');
  const [qty, setQty]                 = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const inCart = cartItems.some(item => item.id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProductById(id);
        const p = res.data;
        setProduct(p);
        setActiveImage(p.image);

        // Fetch related products from same category
        const relRes = await getProducts({ category: p.category });
        setRelated((relRes.data || []).filter(r => r.id !== id).slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Product not found or the server is unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">›</span>
            <span>Loading...</span>
          </nav>
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="pd-error-state">
            <FaExclamationTriangle size={36} color="#e53e3e" />
            <h2>Product Unavailable</h2>
            <p>{error || 'This product could not be found.'}</p>
            <button className="pd-back-btn" onClick={() => navigate('/products')}>
              <FaArrowLeft /> Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const discountPct = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  return (
    <div className="product-detail-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          <span className="breadcrumb-separator">›</span>
          <span style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </span>
        </nav>

        {/* ── MAIN PRODUCT CARD ─────────────────────────────────────── */}
        <div className="product-main-card">

          {/* Left — Gallery */}
          <div className="product-gallery">
            <div className="main-image-wrap">
              {discountPct && (
                <span className="pd-discount-badge">-{discountPct}%</span>
              )}
              <img src={activeImage || product.image} alt={product.name} />
            </div>
            <div className="thumbnail-list">
              {/* Show up to 4 thumbnails (main image repeated as previews) */}
              {[product.image].map((img, idx) => (
                <div
                  key={idx}
                  className={`thumb-wrap ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Middle — Product Info */}
          <div className="product-info-col">
            <div className="stock-status">
              {product.stock > 0 ? (
                <><FaCheck /> In stock ({product.stock} available)</>
              ) : (
                <span style={{ color: '#e53e3e' }}>Out of stock</span>
              )}
            </div>

            <h1 className="product-title">{product.name}</h1>

            <div className="product-meta">
              <div className="meta-item">
                <Stars rating={product.rating} />
                <span className="meta-score">{product.rating}</span>
              </div>
              <span className="meta-divider">•</span>
              <div className="meta-item">
                <FaCommentDots /> {Math.floor(product.stock / 3)} reviews
              </div>
              <span className="meta-divider">•</span>
              <div className="meta-item">
                <FaShoppingBasket /> {Math.floor(product.stock * 2.3)} sold
              </div>
            </div>

            {/* Pricing */}
            <div className="pricing-tier-box">
              <div className="tier-col">
                <div className="tier-price highlight">${product.price.toFixed(2)}</div>
                <div className="tier-qty">Current price</div>
              </div>
              {product.oldPrice && (
                <div className="tier-col">
                  <div className="tier-price" style={{ textDecoration: 'line-through', color: '#a0aec0' }}>${product.oldPrice.toFixed(2)}</div>
                  <div className="tier-qty">Original price</div>
                </div>
              )}
              {discountPct && (
                <div className="tier-col">
                  <div className="tier-price" style={{ color: '#38a169' }}>-{discountPct}%</div>
                  <div className="tier-qty">You save</div>
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="specs-list">
              <div className="spec-row">
                <div className="spec-label">Category:</div>
                <div className="spec-value">
                  <Link to={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: '#0D6EFD' }}>
                    {product.category}
                  </Link>
                </div>
              </div>
              <div className="spec-row">
                <div className="spec-label">Stock:</div>
                <div className="spec-value">{product.stock} units</div>
              </div>
              <div className="spec-row">
                <div className="spec-label">Rating:</div>
                <div className="spec-value">{product.rating} / 10</div>
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="pd-add-cart-row">
              <div className="pd-qty-stepper">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}><FaMinus /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}><FaPlus /></button>
              </div>
              <button
                className={`pd-add-cart-btn ${addedToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FaShoppingCart />
                {addedToCart ? 'Added to cart!' : inCart ? 'Add more to cart' : 'Add to cart'}
              </button>
              <button className="pd-wishlist-btn" title="Save for later">
                <FaRegHeart />
              </button>
            </div>
          </div>

          {/* Right — Supplier Card */}
          <div className="supplier-col">
            <div className="supplier-card">
              <div className="supplier-header">
                <div className="supplier-avatar">S</div>
                <div>
                  <div className="supplier-label">Supplier</div>
                  <div className="supplier-name">Verified Seller LLC</div>
                </div>
              </div>
              <div className="supplier-details">
                <div className="supplier-detail-item">
                  <span style={{ fontSize: '1.1rem' }}>🌍</span> Worldwide
                </div>
                <div className="supplier-detail-item">
                  <FaShieldAlt style={{ color: '#8b96a5' }} /> Verified Seller
                </div>
                <div className="supplier-detail-item">
                  <FaGlobeAmericas style={{ color: '#8b96a5' }} /> Worldwide shipping
                </div>
              </div>
              <button className="supplier-btn-primary">Send inquiry</button>
              <button className="supplier-btn-outline">Seller's profile</button>
            </div>

            <div className="save-for-later">
              <FaRegHeart /> Save for later
            </div>
          </div>

        </div>

        {/* ── TABS + RELATED SIDEBAR ──────────────────────────── */}
        <div className="detail-content-layout">

          {/* Tabs */}
          <div className="tabs-card">
            <div className="tabs-header">
              {['Description', 'Reviews', 'Shipping', 'About seller'].map(tab => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'Description' && (
                <>
                  <p style={{ marginBottom: '1rem', lineHeight: 1.7 }}>{product.description}</p>
                  <table className="spec-table">
                    <tbody>
                      <tr><td>Name</td><td>{product.name}</td></tr>
                      <tr><td>Category</td><td>{product.category}</td></tr>
                      <tr><td>Price</td><td>${product.price.toFixed(2)}</td></tr>
                      <tr><td>Stock</td><td>{product.stock} units</td></tr>
                      <tr><td>Rating</td><td>{product.rating}/10</td></tr>
                    </tbody>
                  </table>
                  <ul className="features-list">
                    <li><FaCheck className="check-icon" /> Free returns within 30 days</li>
                    <li><FaCheck className="check-icon" /> Secure payment & buyer protection</li>
                    <li><FaCheck className="check-icon" /> Worldwide shipping available</li>
                    <li><FaCheck className="check-icon" /> 2-year warranty included</li>
                  </ul>
                </>
              )}
              {activeTab !== 'Description' && (
                <p style={{ color: '#8b96a5' }}>Content for <strong>{activeTab}</strong> goes here...</p>
              )}
            </div>
          </div>

          {/* Related sidebar */}
          <div className="sidebar-card">
            <h3 className="sidebar-title">Related products</h3>
            {related.slice(0, 5).map((item) => (
              <Link to={`/product/${item.id}`} key={item.id} className="mini-product">
                <div className="mini-img-wrap">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="mini-info">
                  <h4>{item.name}</h4>
                  <div className="mini-price">${item.price.toFixed(2)}</div>
                </div>
              </Link>
            ))}
          </div>

        </div>

        {/* ── RELATED PRODUCTS GRID ─────────────────────────── */}
        {related.length > 0 && (
          <div className="related-section">
            <h3 className="related-title">More in {product.category}</h3>
            <div className="related-grid">
              {related.map((item) => (
                <Link to={`/product/${item.id}`} key={item.id} className="related-card">
                  <div className="rel-img-wrap">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <h4 className="rel-title">{item.name}</h4>
                  <div className="rel-price">${item.price.toFixed(2)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── PROMO BANNER ──────────────────────────────────── */}
        <div className="detail-banner">
          <div>
            <h2>Super discount on more than 100 USD</h2>
            <p>Shop more, save more — free shipping on orders above $100</p>
          </div>
          <button className="btn-warning" onClick={() => navigate('/products')}>Shop now</button>
        </div>

      </div>
    </div>
  );
}
