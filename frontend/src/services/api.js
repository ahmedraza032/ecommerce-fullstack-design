import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor for consistent error handling ─────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Product API Methods ────────────────────────────────────────────────────────

/** Fetch all products. Supports optional { search, category } params */
export const getProducts = (params = {}) => api.get('/products', { params });

/** Fetch only featured products (for Home page) */
export const getFeaturedProducts = () => api.get('/products/featured');

/** Fetch a single product by Firebase key */
export const getProductById = (id) => api.get(`/products/${id}`);

/** Create a new product */
export const createProduct = (data) => api.post('/products', data);

/** Update an existing product */
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

/** Delete a product */
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export default api;
