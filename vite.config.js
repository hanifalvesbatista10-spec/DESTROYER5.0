import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import destroyerPatch from './vite-destroyer-patch.js'
import radarCleanup from './vite-radar-cleanup.js'
import targetDuziaPatch from './vite-target-duzia-patch.js'
import focusRepetitionPatch from './vite-focus-repetition.js'
import terminalFilterPatch from './vite-terminal-filter.js'
import last3ClickFilterPatch from './vite-last3-click-filter.js'
import signalFeedbackPatch from './vite-signal-feedback.js'
import directedAnalysisPatch from './vite-directed-analysis.js'
import directedWheelRefinePatch from './vite-directed-wheel-refine.js'
import directedAnalysisHistoryLockPatch from './vite-directed-analysis-history-lock.js'
import terminalSideAlertPatch from './vite-terminal-side-alert.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [destroyerPatch(), radarCleanup(), targetDuziaPatch(), focusRepetitionPatch(), terminalFilterPatch(), last3ClickFilterPatch(), signalFeedbackPatch(), directedAnalysisPatch(), directedWheelRefinePatch(), directedAnalysisHistoryLockPatch(), terminalSideAlertPatch(), react()],
})
