import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import destroyerPatch from './vite-destroyer-patch.js'
import radarCleanup from './vite-radar-cleanup.js'
import targetDuziaPatch from './vite-target-duzia-patch.js'
import focusRepetitionPatch from './vite-focus-repetition.js'
import terminalFilterPatch from './vite-terminal-filter.js'
import last3ClickFilterPatch from './vite-last3-click-filter.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [destroyerPatch(), radarCleanup(), targetDuziaPatch(), focusRepetitionPatch(), terminalFilterPatch(), last3ClickFilterPatch(), react()],
})
