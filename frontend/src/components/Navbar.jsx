import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaUser, FaCommentDots, FaHeart, FaShoppingCart, FaBars, FaSearch, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const categories = [
  'All category', 'Electronics', 'Clothing', 'Home & Outdoor',
  'Sports', 'Accessories',
];

export default function Navbar() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All category');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { currentUser, isAdmin, logout } = useAuth();

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
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
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
            {currentUser ? (
              <div className="nav-icon-item user-profile-menu">
                <FaUser className="icon text-primary" style={{ color: '#0d6efd' }} />
                <span className="desktop-text" title={currentUser.email}>
                  {currentUser.email.split('@')[0]}
                </span>
                <button className="btn-logout-sm" onClick={() => logout()} title="Logout">
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-icon-item">
                <FaUser className="icon" />
                <span className="desktop-text">Profile</span>
              </Link>
            )}
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

      {/* ── SECONDARY NAV (Desktop) ──────────────────────────────── */}
      <div className="secondary-nav desktop-sec-nav">
        <div className="container secondary-nav-inner">
          <div className="sec-nav-left">
            <button className="all-category-btn" onClick={() => navigate('/products')}>
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
            {isAdmin && (
              <Link to="/admin/products" style={{ color: '#ff9017', fontWeight: 600 }}>⚙ Admin</Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE DRAWER MENU ───────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>{currentUser ? `Hi, ${currentUser.email.split('@')[0]}` : 'Menu'}</h3>
              <button className="drawer-close-btn" onClick={() => setMobileMenuOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="drawer-body">
              <form className="mobile-search-box" onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }}>
                <FaSearch className="mobile-search-icon" color="#8b96a5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </form>
              <div className="drawer-divider"></div>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
              <Link to="/products?category=Electronics" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.95rem', color: '#64748b' }}>↳ Electronics</Link>
              <Link to="/products?category=Clothing" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.95rem', color: '#64748b' }}>↳ Clothing</Link>
              <Link to="/products?category=Home+%26+Outdoor" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.95rem', color: '#64748b' }}>↳ Home & Outdoor</Link>
              <Link to="/products?category=Sports" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.95rem', color: '#64748b' }}>↳ Sports</Link>
              <Link to="/products?category=Accessories" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.95rem', color: '#64748b' }}>↳ Accessories</Link>
              <div className="drawer-divider"></div>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>My Cart ({itemCount})</Link>
              {isAdmin && (
                <Link to="/admin/products" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ff9017', fontWeight: 700 }}>
                  ⚙ Admin Panel
                </Link>
              )}
              <div className="drawer-divider"></div>
              {currentUser ? (
                <button className="btn-drawer-logout" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  <FaSignOutAlt /> Logout
                </button>
              ) : (
                <div className="drawer-auth-links">
                  <Link to="/login" className="btn-drawer-login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  <Link to="/signup" className="btn-drawer-signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
