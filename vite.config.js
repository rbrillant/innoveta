import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
  build: {
    outDir: mode === 'admin' ? 'dist-admin' : 'dist',
    rollupOptions: {
      input: mode === 'admin' ? 'admin.html' : 'index.html',
    },
  },
}))
