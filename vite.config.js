import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import destroyerPatch from './vite-destroyer-patch.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [destroyerPatch(), react()],
})
