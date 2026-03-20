import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'parking.local.hiworks.com',
    port: 5173,
    https: {
      key: fs.readFileSync('./parking.local.hiworks.com-key.pem'),
      cert: fs.readFileSync('./parking.local.hiworks.com.pem'),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/hiworks-api': {
        target: 'https://cache-api.gabiaoffice.hiworks.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/hiworks-api/, ''),
      },
      '/account-api': {
        target: 'https://account-api.gabiaoffice.hiworks.com',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        rewrite: (path) => path.replace(/^\/account-api/, ''),
      },
    },
  },
});
