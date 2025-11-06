import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,        // expose sur le LAN
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:9090', // ton Spring
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api/, '')
      }
    }
  }
})
