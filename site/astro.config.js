import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import { satteri } from '@astrojs/markdown-satteri'
import vue from '@astrojs/vue'
import rkui from '@oneonefour/rkui/astro'
import pagefindIndex from './pagefind-index.js'
import { demoSource } from './demo-source.js'

export default defineConfig({
  // A GitHub Pages project page: the site lives under /rkui/, so internal links start with
  // import.meta.env.BASE_URL.
  site: 'https://www.robertcking.com',
  base: '/rkui',
  integrations: [
    mdx(),
    vue({ appEntrypoint: '/src/vue-app.js' }),
    // Fenced code renders as rkui's CodeBlock, and dollar maths as Maths and Equation.
    rkui(),
    pagefindIndex(),
  ],
  markdown: {
    // An inline <Demo> gets its source as its code prop (demo-source.js).
    processor: satteri({ mdastPlugins: [demoSource] }),
    // No page needs Astro's highlighting: fenced code is a CodeBlock, which highlights itself.
    syntaxHighlight: false,
  },
  vite: {
    build: {
      // Keep fonts as files: inlined, every unicode-range subset would load on every page.
      assetsInlineLimit: (filePath) => (filePath.endsWith('.woff2') ? false : undefined),
    },
  },
})
