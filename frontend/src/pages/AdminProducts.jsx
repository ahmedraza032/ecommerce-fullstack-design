import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaCheck, FaTimes,
  FaExclamationTriangle, FaSpinner, FaBoxOpen, FaArrowLeft,
  FaImage, FaStar, FaUpload
} from 'react-icons/fa';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage } from '../services/api';
import ProductImage from '../components/ProductImage';
import './AdminProducts.css';

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Outdoor', 'Sports', 'Accessories'];

const EMPTY_FORM = {
  name: '', price: '', oldPrice: '', image: '',
  description: '', category: 'Electronics',
  stock: '', rating: '', featured: false,
};

/* ── Toast Notification ─────────────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`admin-toast admin-toast--${type}`}>
      {type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}><FaTimes /></button>
    </div>
  );
}

/* ── Confirm Dialog ─────────────────────────────────────────────────────────── */
function ConfirmDialog({ product, onConfirm, onCancel }) {
  return (
    <div className="admin-overlay">
      <div className="confirm-dialog">
        <div className="confirm-icon"><FaTrash /></div>
        <h3>Delete Product?</h3>
        <p>Are you sure you want to delete <strong>"{product.name}"</strong>? This cannot be undone.</p>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-delete-confirm" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Product Form Modal ──────────────────────────────────────────────────────── */
function ProductModal({ mode, product, onSave, onClose, saving }) {
  const [form, setForm] = useState(mode === 'edit' ? {
    name:        product.name        || '',
    price:       product.price       || '',
    oldPrice:    product.oldPrice    || '',
    image:       product.image       || '',
    description: product.description || '',
    category:    product.category    || 'Electronics',
    stock:       product.stock       || '',
    rating:      product.rating      || '',
    featured:    product.featured    || false,
  } : EMPTY_FORM);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
                               e.price    = 'Valid price required';
    if (!form.category)        e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setErrors(err => ({ ...err, imageUpload: null }));

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setForm(f => ({ ...f, image: res.url }));
      }
    } catch (err) {
      setErrors(errs => ({ ...errs, imageUpload: err.message || 'Failed to upload image' }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      price:    Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      stock:    form.stock    ? Number(form.stock)    : 0,
      rating:   form.rating   ? Number(form.rating)   : 0,
    });
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className={`form-input ${errors[key] ? 'input-error' : ''}`}
        value={form[key]}
        placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      />
      {errors[key] && <span className="error-hint">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="admin-overlay">
      <div className="product-modal">
        <div className="modal-header">
          <h2>{mode === 'add' ? '➕ Add New Product' : '✏️ Edit Product'}</h2>
          <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            {/* Left column */}
            <div className="form-col">
              {field('Product Name *', 'name', 'text', 'e.g. iPhone 15 Pro')}
              {field('Price (USD) *', 'price', 'number', '0.00')}
              {field('Old / Original Price', 'oldPrice', 'number', 'Leave blank if no discount')}
              {field('Stock Quantity', 'stock', 'number', '0')}
              {field('Rating (0–5)', 'rating', 'number', '4.5')}

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className={`form-input ${errors.category ? 'input-error' : ''}`}
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group form-checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                  />
                  <span className="checkbox-text">
                    <FaStar style={{ color: '#f59e0b' }} /> Featured product
                  </span>
                </label>
              </div>
            </div>

            {/* Right column */}
            <div className="form-col">
              {field('Image URL', 'image', 'url', 'https://...')}
              
              <div className="form-group" style={{ alignItems: 'center', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>— OR —</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                  <div className="btn-upload-img" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.65rem', border: '1.5px dashed #0D6EFD', borderRadius: '8px',
                    color: '#0D6EFD', fontWeight: 600, transition: 'background 0.15s'
                  }}>
                    {uploadingImage ? <FaSpinner className="spin" /> : <FaUpload />}
                    {uploadingImage ? 'Uploading...' : 'Upload Image File'}
                  </div>
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {errors.imageUpload && <span className="error-hint">{errors.imageUpload}</span>}
              </div>

              {form.image && (
                <div className="image-preview-wrap">
                  <ProductImage
                    src={form.image}
                    alt="Preview"
                    className="image-preview"
                  />
                </div>
              )}
              {!form.image && (
                <div className="image-placeholder">
                  <FaImage size={28} color="#cbd5e0" />
                  <span>Image preview</span>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.description}
                  placeholder="Product description..."
                  rows={5}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? <><FaSpinner className="spin" /> Saving...</> : <><FaCheck /> {mode === 'add' ? 'Add Product' : 'Save Changes'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Admin Page ─────────────────────────────────────────────────────────── */
export default function AdminProducts() {
  const [products, setProducts]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [searchQ, setSearchQ]           = useState('');
  const [catFilter, setCatFilter]       = useState('All');
  const [modal, setModal]               = useState(null);   // null | 'add' | 'edit'
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  /* Fetch */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch {
      showToast('Failed to load products. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  /* Filter */
  useEffect(() => {
    let list = [...products];
    if (catFilter !== 'All') list = list.filter(p => p.category === catFilter);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [products, catFilter, searchQ]);

  /* Create */
  const handleCreate = async (formData) => {
    setSaving(true);
    try {
      await createProduct(formData);
      showToast('Product added successfully!');
      setModal(null);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to create product', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* Update */
  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      await updateProduct(editTarget.id, formData);
      showToast('Product updated successfully!');
      setModal(null);
      setEditTarget(null);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to update product', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* Delete */
  const handleDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id);
      showToast('Product deleted.');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  return (
    <div className="admin-page">

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modals */}
      {modal === 'add' && (
        <ProductModal
          mode="add"
          onSave={handleCreate}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
      {modal === 'edit' && editTarget && (
        <ProductModal
          mode="edit"
          product={editTarget}
          onSave={handleUpdate}
          onClose={() => { setModal(null); setEditTarget(null); }}
          saving={saving}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <Link to="/" className="back-link"><FaArrowLeft /> Back to store</Link>
          <div>
            <h1 className="admin-title">Product Management</h1>
            <p className="admin-subtitle">
              {loading ? 'Loading...' : `${products.length} products in database`}
            </p>
          </div>
        </div>
        <button className="btn-add-product" onClick={() => setModal('add')}>
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Stats Bar */}
      <div className="admin-stats">
        {['All', ...CATEGORIES].map(cat => {
          const count = cat === 'All'
            ? products.length
            : products.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              className={`stat-pill ${catFilter === cat ? 'active' : ''}`}
              onClick={() => setCatFilter(cat)}
            >
              {cat} <span className="stat-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <FaSearch className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search products by name or category..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          {searchQ && (
            <button className="admin-search-clear" onClick={() => setSearchQ('')}>
              <FaTimes />
            </button>
          )}
        </div>
        <span className="results-count">
          Showing {filtered.length} of {products.length}
        </span>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">
            <FaSpinner className="spin" size={28} />
            <p>Loading products from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <FaBoxOpen size={48} color="#cbd5e0" />
            <p>No products found.</p>
            <button className="btn-add-product" onClick={() => setModal('add')}>
              <FaPlus /> Add your first product
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="table-img-wrap">
                      <ProductImage src={product.image} alt={product.name} />
                    </div>
                  </td>
                  <td>
                    <div className="table-name">{product.name}</div>
                    <div className="table-id">ID: {product.id}</div>
                  </td>
                  <td>
                    <span className={`category-badge cat-${product.category?.replace(/\s+&\s+/g, '-').replace(/\s+/g, '-').toLowerCase()}`}>
                      {product.category}
                    </span>
                  </td>
                  <td>
                    <div className="table-price">${Number(product.price).toFixed(2)}</div>
                    {product.oldPrice && (
                      <div className="table-old-price">${Number(product.oldPrice).toFixed(2)}</div>
                    )}
                  </td>
                  <td>
                    <span className={`stock-badge ${product.stock === 0 ? 'out' : product.stock < 20 ? 'low' : 'ok'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td>
                    <div className="rating-cell">
                      <FaStar style={{ color: '#f59e0b', fontSize: '0.8rem' }} />
                      {product.rating}
                    </div>
                  </td>
                  <td>
                    {product.featured
                      ? <span className="featured-yes">✓ Yes</span>
                      : <span className="featured-no">— No</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      <Link
                        to={`/product/${product.id}`}
                        target="_blank"
                        className="btn-view"
                        title="View in store"
                      >
                        View
                      </Link>
                      <button
                        className="btn-edit"
                        title="Edit product"
                        onClick={() => { setEditTarget(product); setModal('edit'); }}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn-delete"
                        title="Delete product"
                        onClick={() => setDeleteTarget(product)}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
