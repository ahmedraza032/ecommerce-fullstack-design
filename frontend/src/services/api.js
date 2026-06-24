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

/** Upload an image directly to Cloudinary */
export const uploadImage = async (formData) => {
  const file = formData.get('image');
  if (!file) {
    throw new Error('No file selected');
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset || cloudName.includes('your_cloud_name')) {
    throw new Error('Cloudinary configuration missing in environment variables (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)');
  }

  const cloudinaryData = new FormData();
  cloudinaryData.append('file', file);
  cloudinaryData.append('upload_preset', uploadPreset);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    cloudinaryData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return { success: true, url: res.data.secure_url };
};

export default api;
