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
    // Fenced code renders as rkui's CodeBlock, and dollar maths as Maths and Equation. The docs
    // layout imports the stylesheet itself, after KaTeX's. Readers switch every setting.
    rkui({
      code: { copy: 'hover' },
      head: { styles: false },
      settings: { switchable: ['theme', 'palette', 'shadow', 'highlight', 'dots', 'light'] },
    }),
    pagefindIndex(),
  ],
  markdown: {
    // An inline <Demo> gets its source as its code prop (demo-source.js).
    processor: satteri({ mdastPlugins: [demoSource] }),
    // No page needs Astro's highlighting: fenced code is a CodeBlock, which highlights itself.
    syntaxHighlight: false,
  },
})
