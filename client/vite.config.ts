import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, proxy /api calls to the Node server so the browser talks to one origin.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
