import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Main website — no role lock, shows landing page at /
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    proxy: { '/api': 'http://localhost:5000' }
  },
  define: {
    __APP_ROLE__: JSON.stringify(null)
  }
});
