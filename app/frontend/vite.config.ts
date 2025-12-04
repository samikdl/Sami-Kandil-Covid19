/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api/, '')
      }
    }
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setupTests.ts',
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx'
    ]
  }
});
