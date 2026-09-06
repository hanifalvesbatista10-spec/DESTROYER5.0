import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import destroyerPatch from './vite-destroyer-patch.js'
import radarCleanup from './vite-radar-cleanup.js'
import targetDuziaPatch from './vite-target-duzia-patch.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [destroyerPatch(), radarCleanup(), targetDuziaPatch(), react()],
})
