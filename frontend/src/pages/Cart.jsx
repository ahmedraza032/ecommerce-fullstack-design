import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaLock, FaCommentDots, FaTruck, FaShoppingCart,
  FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcAmex, FaApplePay,
  FaMinus, FaPlus, FaTimes, FaShoppingBag
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQty, clearCart, subtotal, tax, total } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="cart-title">My cart (0)</h1>
          <div className="cart-empty-state">
            <FaShoppingBag size={64} color="#e2e8f0" />
            <h2>Your cart is empty</h2>
            <p>Start adding some products to your cart!</p>
            <button className="btn-checkout" onClick={() => navigate('/products')}>
              Browse products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">

      {/* ── MOBILE PAGE HEADER ─────────────────────────────────── */}
      <div className="mobile-page-header">
        <button className="mobile-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h2 className="mobile-page-title">Shopping cart</h2>
        <div style={{ width: 32 }} />
      </div>

      <div className="container">

        {/* Desktop title */}
        <h1 className="cart-title">My cart ({cartItems.length})</h1>

        <div className="cart-layout">

          {/* ── LEFT: Cart Items ── */}
          <div className="cart-main-col">
            <div className="cart-items-card">

              {cartItems.map(item => (
                <div key={item.id} className="cart-item">

                  {/* Image */}
                  <div className="cart-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>

                  {/* Info */}
                  <div className="cart-item-info">
                    <h3 className="cart-item-title">{item.name}</h3>
                    <div className="cart-item-specs">Category: {item.category}</div>
                    <div className="cart-item-seller">Stock: {item.stock} available</div>
                    <div className="cart-item-actions">
                      <button
                        className="btn-action-sm text-danger"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                      <Link
                        to={`/product/${item.id}`}
                        className="btn-action-sm text-primary"
                        style={{ textDecoration: 'none' }}
                      >
                        View details
                      </Link>
                    </div>
                  </div>

                  {/* Price + Qty (Desktop select) */}
                  <div className="cart-item-price-block">
                    <div className="cart-item-price">${item.price.toFixed(2)}</div>
                    <select
                      className="qty-select"
                      value={item.qty}
                      onChange={e => updateQty(item.id, parseInt(e.target.value))}
                    >
                      {[...Array(Math.min(item.stock || 20, 20)).keys()].map(n => (
                        <option key={n + 1} value={n + 1}>Qty: {n + 1}</option>
                      ))}
                    </select>
                    <div className="cart-item-subtotal">
                      Subtotal: <strong>${(item.price * item.qty).toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Mobile qty stepper */}
                  <div className="mobile-qty-price-row">
                    <div className="qty-stepper">
                      <button className="stepper-btn" onClick={() => updateQty(item.id, item.qty - 1)}><FaMinus /></button>
                      <span className="stepper-val">{item.qty}</span>
                      <button className="stepper-btn" onClick={() => updateQty(item.id, item.qty + 1)}><FaPlus /></button>
                    </div>
                    <div className="cart-item-price">${(item.price * item.qty).toFixed(2)}</div>
                  </div>

                </div>
              ))}

              {/* Footer actions */}
              <div className="cart-actions-footer">
                <button className="btn-back" onClick={() => navigate('/products')}>
                  <FaArrowLeft /> Continue shopping
                </button>
                <button className="btn-remove-all" onClick={clearCart}>
                  Clear cart
                </button>
              </div>
            </div>

            {/* Trust features */}
            <div className="features-row">
              <div className="feature-block">
                <div className="feature-icon-circle"><FaLock /></div>
                <div><h4>Secure payment</h4><p>Your data is safe with us</p></div>
              </div>
              <div className="feature-block">
                <div className="feature-icon-circle"><FaCommentDots /></div>
                <div><h4>Customer support</h4><p>24/7 support available</p></div>
              </div>
              <div className="feature-block">
                <div className="feature-icon-circle"><FaTruck /></div>
                <div><h4>Free delivery</h4><p>On orders over $100</p></div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className="sidebar-col">

            {/* Coupon */}
            <div className="coupon-box">
              <h4>Have a coupon?</h4>
              <div className="coupon-input-group">
                <input type="text" className="coupon-input" placeholder="Add coupon" />
                <button className="btn-apply">Apply</button>
              </div>
            </div>

            {/* Order summary */}
            <div className="summary-box">
              <div className="summary-row">
                <span>Subtotal ({cartItems.reduce((s, i) => s + i.qty, 0)} items):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row tax">
                <span>Tax (10%):</span>
                <span>+ ${tax.toFixed(2)}</span>
              </div>
              <div className="summary-divider" />
              <div className="total-row">
                <span>Total:</span>
                <span className="total-price">${total.toFixed(2)}</span>
              </div>
              <button className="btn-checkout">Checkout</button>
              <div className="payment-icons">
                <FaCcAmex /><FaCcMastercard /><FaCcPaypal /><FaCcVisa /><FaApplePay />
              </div>
            </div>

          </div>
        </div>

        {/* ── PROMO BANNER ── */}
        <div className="detail-banner">
          <div>
            <h2>Super discount on more than 100 USD</h2>
            <p>Have you ever finally just write dummy info</p>
          </div>
          <button className="btn-warning" onClick={() => navigate('/products')}>Shop now</button>
        </div>

      </div>
    </div>
  );
}
