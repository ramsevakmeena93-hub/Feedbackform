import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND = process.env.VITE_API_URL || 'https://feedbackbackend-production-db19.up.railway.app';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    proxy: { '/api': BACKEND }
  },
  build: { outDir: 'dist-main' },
  define: { __APP_ROLE__: JSON.stringify(null) }
});
