import axios from 'axios';

// In production (Vercel), VITE_API_URL points to Railway backend.
// In dev, Vite proxy handles /api → localhost:5000.
const baseURL = import.meta.env.VITE_API_URL || '';

if (baseURL) {
  axios.defaults.baseURL = baseURL;
}

export default axios;
