// Playwright opens the built docs site in a headless browser, to take screenshots and run a few
// smoke checks. Build first (`npm run build`), then `npm run screenshots`.
import { defineConfig } from '@playwright/test'

const PORT = 4400
// The site is built for GitHub Pages under /rkui/ (astro.config.js `base`), so it is served there.
const BASE = '/rkui/'

export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    // Vite's static preview: `astro preview` exits early here with no error message.
    command: `npx vite preview --outDir site/dist --port ${PORT} --strictPort --base ${BASE}`,
    port: PORT,
    reuseExistingServer: false,
  },
})
