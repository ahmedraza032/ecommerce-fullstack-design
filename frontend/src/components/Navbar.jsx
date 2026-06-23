import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaUser, FaCommentDots, FaHeart, FaShoppingCart, FaBars, FaSearch } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const categories = [
  'All category', 'Electronics', 'Clothing', 'Home & Outdoor',
  'Sports', 'Accessories',
];

export default function Navbar() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All category');
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category !== 'All category') params.set('category', category);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <nav className="navbar">
      {/* ── TOP BAR ──────────────────────────────────────────────── */}
      <div className="nav-top">
        <div className="container nav-top-inner">
          <div className="mobile-left">
            <button className="mobile-menu-btn">
              <FaBars />
            </button>
            <Link to="/" className="brand-logo">
              <img src="/assets/Brand/logo-colored.svg" alt="Brand Logo" height="40" />
            </Link>
          </div>

          {/* Desktop Search */}
          <form className="search-bar desktop-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            <select
              className="category-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button type="submit" className="search-btn">
              <FaSearch size={14} />
              Search
            </button>
          </form>

          {/* Right Icons */}
          <div className="nav-icons">
            <Link to="/login" className="nav-icon-item">
              <FaUser className="icon" />
              <span className="desktop-text">Profile</span>
            </Link>
            <Link to="/messages" className="nav-icon-item desktop-icon">
              <FaCommentDots className="icon" />
              <span className="desktop-text">Message</span>
            </Link>
            <Link to="/orders" className="nav-icon-item desktop-icon">
              <FaHeart className="icon" />
              <span className="desktop-text">Orders</span>
            </Link>
            <Link to="/cart" className="nav-icon-item nav-icon-cart" style={{ position: 'relative' }}>
              <FaShoppingCart className="icon" />
              {itemCount > 0 && (
                <span className="cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>
              )}
              <span className="desktop-text">My cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── MOBILE SEARCH & PILLS ────────────────────────────────── */}
      <div className="mobile-sub-nav">
        <div className="container">
          <form className="mobile-search-box" onSubmit={handleSearch}>
            <FaSearch className="mobile-search-icon" color="#8b96a5" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
          <div className="mobile-category-pills">
            {['All', 'Electronics', 'Clothing', 'Home', 'Sports'].map((cat, i) => (
              <span
                key={cat}
                className={`pill ${category === (cat === 'All' ? 'All category' : cat) ? 'active' : ''}`}
                onClick={() => {
                  const val = cat === 'All' ? 'All category' : cat;
                  setCategory(val);
                  navigate(`/products${val !== 'All category' ? `?category=${val}` : ''}`);
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECONDARY NAV (Desktop) ──────────────────────────────── */}
      <div className="secondary-nav desktop-sec-nav">
        <div className="container secondary-nav-inner">
          <div className="sec-nav-left">
            <button className="all-category-btn">
              <FaBars /> All category
            </button>
            <Link to="/products?category=Electronics">Electronics</Link>
            <Link to="/products?category=Clothing">Clothing</Link>
            <Link to="/products?category=Home+%26+Outdoor">Home & Outdoor</Link>
            <Link to="/products?category=Sports">Sports</Link>
            <Link to="/products?category=Accessories">Accessories</Link>
          </div>
          <div className="sec-nav-right">
            <span>English, USD</span>
            <span>🚚 Free shipping</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
