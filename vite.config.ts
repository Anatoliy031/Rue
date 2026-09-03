import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base подставляется автоматически GitHub Actions из имени репозитория.
// Локально всегда '/'.
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/leaflet')) return 'leaflet'
          if (id.includes('node_modules/framer-motion')) return 'motion'
          if (id.includes('node_modules/react')) return 'react'
        },
      },
    },
  },
})
