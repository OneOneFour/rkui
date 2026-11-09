import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import { satteri } from '@astrojs/markdown-satteri'
import vue from '@astrojs/vue'
import pagefindIndex from './pagefind-index.js'
import { demoSource } from './demo-source.js'

export default defineConfig({
  // A GitHub Pages project page: the site lives under /rkui/, so internal links start with
  // import.meta.env.BASE_URL.
  site: 'https://www.robertcking.com',
  base: '/rkui',
  integrations: [
    // An inline <Demo> gets its source as its code prop (demo-source.js).
    mdx({ processor: satteri({ mdastPlugins: [demoSource] }) }),
    vue({ appEntrypoint: '/src/vue-app.js' }),
    pagefindIndex(),
  ],
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
