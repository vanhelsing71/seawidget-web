import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all network addresses (accessible via iPhone on local WiFi)
    port: 3000,
  },
  preview: {
    host: true,
    port: 3000,
  },
});
