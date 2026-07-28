import axios from 'axios';

// In production (Vercel), VITE_API_URL points to Railway backend.
// Falls back to the known Railway URL so the app works even without the env var.
// In dev, Vite proxy handles /api → localhost:5000 (baseURL stays empty).
const isProd = import.meta.env.PROD;
const baseURL = import.meta.env.VITE_API_URL
  || (isProd ? 'https://feedbackbackend-production-db19.up.railway.app' : '');

if (baseURL) {
  axios.defaults.baseURL = baseURL;
}

export default axios;
