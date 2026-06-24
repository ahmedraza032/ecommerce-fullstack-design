import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaExclamationCircle, FaSpinner, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // Reusing premium auth styles

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const configuredAdminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (email.trim().toLowerCase() !== configuredAdminEmail.toLowerCase()) {
      setError('Access denied: This account is not registered as an administrator.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your admin credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ borderTop: '5px solid #ff9017' }}>
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: '#fff7ed', color: '#ff9017', padding: '1rem', borderRadius: '50%' }}>
              <FaShieldAlt size={32} />
            </div>
          </div>
          <h1>Admin Portal Login</h1>
          <p>Secure login for store administrators</p>
        </div>

        {error && (
          <div className="auth-alert" style={{ background: '#fef2f2', borderLeftColor: '#ef4444' }}>
            <FaExclamationCircle size={20} style={{ minWidth: '20px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="admin-email">Admin Email Address</label>
            <div className="auth-input-wrap">
              <input
                id="admin-email"
                type="email"
                className="auth-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaEnvelope className="auth-icon" />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="admin-password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="admin-password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className="auth-icon" />
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', boxShadow: '0 8px 20px -6px rgba(234, 88, 12, 0.4)' }}
          >
            {loading ? <><FaSpinner className="spin" /> Verifying Admin...</> : 'Login as Admin'}
          </button>
        </form>

        <div className="auth-footer" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
          <FaArrowLeft size={12} /> <Link to="/login" className="auth-link">Return to normal user login</Link>
        </div>
      </div>
    </div>
  );
}
