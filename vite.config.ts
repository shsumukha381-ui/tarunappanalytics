import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on 127.0.0.1 so Google OAuth Desktop app loopback redirects
    // (e.g. http://127.0.0.1:5173/oauth/callback) land in this dev server.
    host: '127.0.0.1',
    port: 5173,
  },
})
