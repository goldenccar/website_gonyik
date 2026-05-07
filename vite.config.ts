import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@server': path.resolve(__dirname, './server'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React ecosystem
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router') || id.includes('node_modules/scheduler')) {
            return 'vendor'
          }
          // Animation library
          if (id.includes('node_modules/framer-motion')) {
            return 'motion'
          }
          // PDF viewer (heavy)
          if (id.includes('node_modules/react-pdf') || id.includes('node_modules/pdfjs')) {
            return 'pdf'
          }
        },
      },
    },
  },
})
