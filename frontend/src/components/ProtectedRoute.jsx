import { Navigate, Link } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)', padding: '2rem', textAlign: 'center', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: '#fee2e2', color: '#ef4444', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem'
        }}>
          <FaLock size={40} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
          Access Restricted
        </h1>
        <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '2rem', lineHeight: 1.6 }}>
          You do not have administrator privileges to view this page. If you believe this is an error, please contact the site admin.
        </p>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
          background: '#0d6efd', color: '#fff', fontWeight: 700, borderRadius: '12px', textDecoration: 'none',
          boxShadow: '0 8px 20px -6px rgba(13,110,253,0.4)', transition: 'all 0.2s ease'
        }}>
          <FaArrowLeft /> Return to Store
        </Link>
      </div>
    );
  }

  return children;
}
