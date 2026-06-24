import axios from 'axios';
import { auth } from './firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor to attach Firebase ID token ────────────────────────────
api.interceptors.request.use(
  async (config) => {
    if (auth?.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error('Failed to get ID token:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

/** Upload an image */
export const uploadImage = (formData) => api.post('/products/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;
