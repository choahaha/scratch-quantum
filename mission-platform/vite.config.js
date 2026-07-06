import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fixed port: the scratch-gui embed bridge allowlists this origin
  // (MISSION_PLATFORM_ORIGINS) at build time.
  server: {
    port: 5175,
    strictPort: true
  }
})
