// Playwright opens the built docs site in a headless browser, to take screenshots and run a few
// smoke checks. Build first (`npm run build`), then `npm run screenshots`.
import { defineConfig } from '@playwright/test'

// RKUI_PORT lets agents in parallel worktrees each use their own port.
const PORT = Number(process.env.RKUI_PORT ?? 4400)
// The site is built for GitHub Pages under /rkui/ (astro.config.js `base`), so it is served there.
const BASE = '/rkui/'

export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    viewport: { width: 1280, height: 900 },
    // Screenshots show the settled page: with reduced motion the duration tokens are zero, so no
    // transition or entrance is caught halfway.
    reducedMotion: 'reduce',
  },
  webServer: {
    // Vite's static preview: `astro preview` exits early here with no error message.
    command: `npx vite preview --outDir site/dist --port ${PORT} --strictPort --base ${BASE}`,
    port: PORT,
    reuseExistingServer: false,
  },
})
