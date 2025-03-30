// apps/signup/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: '/signup/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, '../../packages/ui/src'),
      '@scivalidate/ui': resolve(__dirname, '../../packages/ui'),
      '@scivalidate/api-client': resolve(__dirname, '../../packages/api-client'),
      '@scivalidate/utils': resolve(__dirname, '../../packages/utilities'),
      '@scivalidate/config': resolve(__dirname, '../../packages/config'),
    }
  },
  build: {
    outDir: '../../dist/signup',
    emptyOutDir: true,
  },
  server: {
    port: 3003, // Assign different ports to different apps
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@scivalidate/ui', '@scivalidate/api-client', '@scivalidate/utils', '@scivalidate/config']
  }
});