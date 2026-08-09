import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import localApiPlugin from './localApiPlugin.mjs'

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: { host: true },
  build: {
    // Keep react/react-dom/router in a stable vendor chunk so repeat visits only
    // re-download the (small) page chunk that actually changed, not the whole bundle.
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    cssCodeSplit: true,
    reportCompressedSize: false,
  },
})
