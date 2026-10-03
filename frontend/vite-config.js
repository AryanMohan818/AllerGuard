import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Enable polling so hot-reloading works properly across Docker volumes
    watch: {
      usePolling: true
    }
  }
});