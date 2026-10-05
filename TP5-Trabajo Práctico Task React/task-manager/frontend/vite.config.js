import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo (npm run dev) Vite reenvia /api a la API local, asi el frontend usa
// siempre rutas relativas. En Docker ese mismo trabajo lo hace nginx (ver nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': process.env.API_URL || 'http://localhost:3001',
    },
  },
})
