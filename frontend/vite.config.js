import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/tmap': {
        target: 'https://apis.openapi.sk.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/tmap/, '/tmap'),
      },
    },
  },
})
