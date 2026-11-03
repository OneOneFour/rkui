import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import pagefindIndex from './pagefind-index.js'

export default defineConfig({
  // A GitHub Pages project page: the site lives under /rkui/, so internal links start with
  // import.meta.env.BASE_URL.
  site: 'https://www.robertcking.com',
  base: '/rkui',
  integrations: [mdx(), pagefindIndex()],
  // Fenced code renders through rkui's CodeBlock, which highlights it (CodeFence.astro), so
  // Markdown leaves it as plain text.
  markdown: { syntaxHighlight: false },
  vite: {
    build: {
      // Keep fonts as files: inlined, every unicode-range subset would load on every page.
      assetsInlineLimit: (filePath) => (filePath.endsWith('.woff2') ? false : undefined),
    },
  },
})
