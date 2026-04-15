import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Config para que el frontend sepa a qué backend llamar
    'process.env.VITE_API_URL': JSON.stringify('https://glassy.es/api')
  }
})
