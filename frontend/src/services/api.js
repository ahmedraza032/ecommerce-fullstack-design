import axios from 'axios';
import { auth } from './firebase';

// In local dev, Vite proxies /api → localhost:5000
// In production, Vercel routes /api/* → backend serverless function
const BASE_URL = '/api';

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

/** Upload an image - Converts file to Base64 Data URL directly to completely bypass Vercel serverless multipart/multer limitations */
export const uploadImage = async (formData) => {
  const file = formData.get('image');
  if (!file) {
    throw new Error('No file selected');
  }
  const base64Url = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  return { success: true, url: base64Url };
};

export default api;
