import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaCheck, FaStar, FaRegStar, FaStarHalfAlt, FaRegHeart, FaThLarge, FaListUl,
  FaChevronUp, FaChevronDown, FaTimes, FaShoppingCart, FaUser,
  FaSearch, FaSlidersH, FaArrowLeft, FaChevronLeft, FaChevronRight,
  FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductImage from '../components/ProductImage';
import './ProductList.css';

const ITEMS_PER_PAGE = 9;

/* ── Stars helper ────────────────────────────────────────────────────────────── */
function Stars({ rating = 0 }) {
  // Rating is natively 0-5
  const score = Number(rating);
  const fullStars = Math.floor(score);
  const hasHalfStar = score - fullStars >= 0.25;

  return (
    <div className="rating-stars" style={{ color: '#ff9017', display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) return <FaStar key={i} />;
        if (i === fullStars && hasHalfStar) return <FaStarHalfAlt key={i} />;
        return <FaRegStar key={i} color="#cbd5e0" />;
      })}
    </div>
  );
}

/* ── Product Skeleton ────────────────────────────────────────────────────────── */
function ProductSkeletonGrid({ count = 9 }) {
  return Array(count).fill(null).map((_, i) => (
    <div key={i} className="product-grid-card skeleton-product-card">
      <div className="product-grid-img-wrap skeleton-img-box" />
      <div className="product-grid-details">
        <div className="skeleton-bar" style={{ width: '60%', height: 18, marginBottom: 8 }} />
        <div className="skeleton-bar" style={{ width: '40%', height: 14, marginBottom: 6 }} />
        <div className="skeleton-bar" style={{ width: '80%', height: 14 }} />
      </div>
    </div>
  ));
}

/* ── Component ───────────────────────────────────────────────────────────────── */
export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // URL-driven state
  const urlSearch   = searchParams.get('search')   || '';
  const urlCategory = searchParams.get('category') || '';

  const [searchInput, setSearchInput]     = useState(urlSearch);
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [viewMode, setViewMode]           = useState('grid');
  const [verifiedOnly, setVerifiedOnly]   = useState(false);
  const [sortBy, setSortBy]               = useState('featured');
  const [currentPage, setCurrentPage]     = useState(1);
  const [addedToCart, setAddedToCart]     = useState({});

  // Filter sidebar state
  const [openGroups, setOpenGroups] = useState({
    Category: true, Brands: true, Features: true,
    Price: false, Condition: false, Ratings: false,
  });
  const toggleGroup = (key) => setOpenGroups(g => ({ ...g, [key]: !g[key] }));

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (urlSearch)   params.search   = urlSearch;
        if (urlCategory) params.category = urlCategory;
        const res = await getProducts(params);
        setProducts(res.data || []);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Could not load products. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [urlSearch, urlCategory]);

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (searchInput.trim()) params.search = searchInput.trim();
    if (urlCategory) params.category = urlCategory;
    setSearchParams(params);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedToCart(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  // Sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc')  return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating')     return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginated  = sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const pageTitle = urlCategory
    ? urlCategory
    : urlSearch
    ? `Results for "${urlSearch}"`
    : 'All Products';

  return (
    <div className="product-list-page">

      {/* ── MOBILE PAGE HEADER ─────────────────────────────────── */}
      <div className="mobile-page-header">
        <button className="mobile-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h2 className="mobile-page-title">{pageTitle}</h2>
        <div className="mobile-header-icons">
          <Link to="/cart"><FaShoppingCart /></Link>
          <Link to="/login"><FaUser /></Link>
        </div>
      </div>

      {/* ── MOBILE SEARCH ──────────────────────────────────────── */}
      <div className="mobile-search-row">
        <form className="mobile-search-inner" onSubmit={handleSearch}>
          <FaSearch color="#8b96a5" size={13} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </form>
      </div>

      {/* ── MOBILE CATEGORY PILLS ──────────────────────────────── */}
      <div className="mobile-pills-row">
        {['All', 'Electronics', 'Clothing', 'Home & Outdoor', 'Sports', 'Accessories'].map((cat, i) => (
          <span
            key={cat}
            className={`pill ${(cat === 'All' && !urlCategory) || cat === urlCategory ? 'active' : ''}`}
            onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* ── PAGE BODY ──────────────────────────────────────────── */}
      <div className="container">

        {/* Breadcrumb */}
        <nav className="breadcrumb desktop-only" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">›</span>
          {urlCategory ? (
            <span>{urlCategory}</span>
          ) : urlSearch ? (
            <span>Search: "{urlSearch}"</span>
          ) : (
            <span>All Products</span>
          )}
        </nav>

        <div className="product-list-layout">

          {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
          <aside className="filter-sidebar desktop-only">

            {/* Category */}
            <div className="filter-group">
              <div className="filter-header" onClick={() => toggleGroup('Category')}>
                <span>Category</span>
                {openGroups.Category ? <FaChevronUp size={13} color="#a0aec0" /> : <FaChevronDown size={13} color="#a0aec0" />}
              </div>
              {openGroups.Category && (
                <ul className="filter-list">
                  {['Electronics', 'Clothing', 'Home & Outdoor', 'Sports', 'Accessories'].map(cat => (
                    <li
                      key={cat}
                      className={urlCategory === cat ? 'active' : ''}
                      onClick={() => setSearchParams(cat === urlCategory ? {} : { category: cat })}
                      style={{ cursor: 'pointer' }}
                    >
                      {cat}
                    </li>
                  ))}
                  {urlCategory && (
                    <li onClick={() => setSearchParams({})} style={{ cursor: 'pointer', color: '#e53e3e' }}>
                      × Clear filter
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Price range */}
            <div className="filter-group">
              <div className="filter-header" onClick={() => toggleGroup('Price')}>
                <span>Price range</span>
                {openGroups.Price ? <FaChevronUp size={13} color="#a0aec0" /> : <FaChevronDown size={13} color="#a0aec0" />}
              </div>
              {openGroups.Price && (
                <>
                  <div className="price-range-track">
                    <div className="price-range-fill" />
                    <div className="price-thumb" style={{ left: '20%' }} />
                    <div className="price-thumb" style={{ right: '30%', left: 'auto', transform: 'translate(50%,-50%)' }} />
                  </div>
                  <div className="price-inputs-row">
                    <div className="price-input-wrap">
                      <div className="price-input-label">Min</div>
                      <input type="number" className="price-input" placeholder="0" />
                    </div>
                    <div className="price-input-wrap">
                      <div className="price-input-label">Max</div>
                      <input type="number" className="price-input" placeholder="9999" />
                    </div>
                  </div>
                  <button className="btn-apply">Apply</button>
                </>
              )}
            </div>

            {/* Ratings */}
            <div className="filter-group">
              <div className="filter-header" onClick={() => toggleGroup('Ratings')}>
                <span>Ratings</span>
                {openGroups.Ratings ? <FaChevronUp size={13} color="#a0aec0" /> : <FaChevronDown size={13} color="#a0aec0" />}
              </div>
              {openGroups.Ratings && (
                <ul className="filter-list">
                  <li><div className="custom-checkbox" /><div className="rating-stars"><FaStar/><FaStar/><FaStar/><FaStar/><FaStar/></div></li>
                  <li><div className="custom-checkbox" /><div className="rating-stars"><FaStar/><FaStar/><FaStar/><FaStar/><FaRegStar color="#cbd5e0"/></div></li>
                  <li><div className="custom-checkbox" /><div className="rating-stars"><FaStar/><FaStar/><FaStar/><FaRegStar color="#cbd5e0"/><FaRegStar color="#cbd5e0"/></div></li>
                </ul>
              )}
            </div>

          </aside>

          {/* ══ MAIN CONTENT ════════════════════════════════════════ */}
          <div className="product-main-content">

            {/* Desktop Toolbar */}
            <div className="list-toolbar desktop-only">
              <div className="toolbar-info">
                {loading ? (
                  <span>Loading products...</span>
                ) : (
                  <><strong>{products.length} items</strong> {urlCategory ? `in ${urlCategory}` : urlSearch ? `for "${urlSearch}"` : 'total'}</>
                )}
              </div>
              <div className="toolbar-controls">
                <label className="verified-toggle" onClick={() => setVerifiedOnly(v => !v)}>
                  <div
                    className="custom-checkbox"
                    style={{ background: verifiedOnly ? '#0D6EFD' : 'transparent', borderColor: verifiedOnly ? '#0D6EFD' : '#cbd5e0', color: 'white' }}
                  >
                    {verifiedOnly && <FaCheck size={9} />}
                  </div>
                  Verified only
                </label>
                <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <div className="view-toggles">
                  <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view"><FaThLarge /></button>
                  <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view"><FaListUl /></button>
                </div>
              </div>
            </div>

            {/* Mobile Toolbar */}
            <div className="mobile-toolbar">
              <button className="mobile-sort-btn"><FaListUl size={11} /> Sort</button>
              <button className="mobile-filter-btn"><FaSlidersH size={11} /> Filter</button>
              <div className="mobile-view-toggles">
                <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><FaThLarge /></button>
                <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><FaListUl /></button>
              </div>
            </div>

            {/* ── ERROR STATE ── */}
            {error && (
              <div className="pl-error-banner">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            {/* ── LOADING STATE ── */}
            {loading ? (
              <div className="products-grid">
                <ProductSkeletonGrid count={9} />
              </div>
            ) : paginated.length === 0 ? (
              <div className="pl-empty-state">
                <p>No products found{urlSearch ? ` for "${urlSearch}"` : ''}.</p>
                <button className="btn-apply" onClick={() => setSearchParams({})}>Clear filters</button>
              </div>
            ) : (
              /* ── PRODUCTS GRID / LIST ── */
              <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
                {paginated.map(p =>
                  viewMode === 'list' ? (
                    /* LIST CARD */
                    <div key={p.id} className="product-list-card">
                      <div className="product-list-img-wrap">
                        <ProductImage src={p.image} alt={p.name} />
                      </div>
                      <div className="product-list-info">
                        <h3 className="product-list-title">{p.name}</h3>
                        <div className="product-list-pricing">
                          <span className="price-main">${p.price.toFixed(2)}</span>
                          {p.oldPrice && <span className="price-old">${p.oldPrice.toFixed(2)}</span>}
                        </div>
                        <div className="product-list-stats">
                          <Stars rating={p.rating} />
                          <span style={{ color: '#ffb800', fontWeight: 600 }}>{p.rating}</span>
                          <span className="stat-dot">•</span>
                          <span className="free-shipping">Free Shipping</span>
                        </div>
                        <p className="product-list-desc">{p.description}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <Link to={`/product/${p.id}`} className="view-details-link">View details</Link>
                          <button
                            className={`btn-add-cart ${addedToCart[p.id] ? 'added' : ''}`}
                            onClick={(e) => handleAddToCart(e, p)}
                          >
                            {addedToCart[p.id] ? <><FaCheck size={11}/> Added!</> : <><FaShoppingCart size={11}/> Add to cart</>}
                          </button>
                        </div>
                      </div>
                      <button className="favorite-btn" aria-label="Save to wishlist"><FaRegHeart /></button>
                    </div>
                  ) : (
                    /* GRID CARD */
                    <Link to={`/product/${p.id}`} key={p.id} className="product-grid-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="product-grid-img-wrap">
                        <ProductImage src={p.image} alt={p.name} />
                      </div>
                      <div className="product-grid-details">
                        <div className="grid-price-row">
                          <div className="grid-prices">
                            <span className="price-main">${p.price.toFixed(2)}</span>
                            {p.oldPrice && <span className="price-old">${p.oldPrice.toFixed(2)}</span>}
                          </div>
                          <button
                            className="favorite-btn-small"
                            aria-label="Save to wishlist"
                            onClick={e => e.preventDefault()}
                          >
                            <FaRegHeart />
                          </button>
                        </div>
                        <div className="grid-rating-row">
                          <Stars rating={p.rating} />
                          <span className="grid-rating-score">{p.rating}</span>
                        </div>
                        <h3 className="grid-title">{p.name}</h3>
                        <button
                          className={`btn-add-cart-grid ${addedToCart[p.id] ? 'added' : ''}`}
                          onClick={(e) => handleAddToCart(e, p)}
                        >
                          {addedToCart[p.id] ? <><FaCheck size={10}/> Added!</> : <><FaShoppingCart size={10}/> Add to cart</>}
                        </button>
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="pagination-area desktop-only">
                <div className="pagination-controls">
                  <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <FaChevronLeft size={11} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                    <button
                      key={pg}
                      className={`page-btn ${currentPage === pg ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pg)}
                    >
                      {pg}
                    </button>
                  ))}
                  <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <FaChevronRight size={11} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
