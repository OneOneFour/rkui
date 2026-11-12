/**
 * rkui's Astro integration. It sets up a site: the stylesheet, the global settings and the enhance
 * scripts on every page, one copy of Vue, fonts kept as files, and a licences file in the build.
 * In MDX files, a fenced code block renders as `CodeBlock`, `$…$` as `Maths` and `$$…$$` as
 * `Equation`, with no tags to write.
 *
 *   // astro.config.mjs
 *   import vue from '@astrojs/vue'
 *   import rkui from '@oneonefour/rkui/astro'
 *   export default defineConfig({ integrations: [vue(), rkui()] })
 *
 * For the MDX part, add `@astrojs/mdx`.
 * It adds a plugin to Sätteri, Astro's Markdown processor, on `markdown.processor`, which MDX
 * inherits: options given to `mdx({ processor })` instead are out of its reach, and it warns when
 * MDX compiles without it. `.md` files are left as they were, dollars included.
 */

import { pathToFileURL } from 'node:url'
import {
  bakeFixedSettings,
  checkedSettings,
  injectHead,
  viteSettings,
  writeLicences,
} from './setup.js'

const CODE_BLOCK = '@oneonefour/rkui/components/code/CodeBlock.vue'
const MATHS = '@oneonefour/rkui/components/maths/Maths.vue'
const EQUATION = '@oneonefour/rkui/components/maths/Equation.vue'

/** A JSX attribute: a string, or `true` for one written bare (`editor`). */
function attribute(name, value) {
  return { type: 'mdxJsxAttribute', name, value: value === true ? null : value }
}

/** CodeBlock's attributes for a fence: its language, its meta as the label, then the defaults. */
function codeAttributes(node, defaults) {
  const attributes = [attribute('lang', node.lang ?? 'plaintext')]
  if (node.meta) attributes.push(attribute('label', node.meta.trim()))
  for (const [name, value] of Object.entries(defaults)) {
    if (value !== false) attributes.push(attribute(name, value))
  }
  // The copy button needs JavaScript.
  if (defaults.copy !== 'never') attributes.push(attribute('client:visible', true))
  return attributes
}

/**
 * The MDX plugin, made afresh for each file. Each fence and dollar run becomes a component, under
 * a name of the plugin's own so it can't clash with the file's imports, and the imports for the
 * ones used are added at the top.
 */
function mdxPlugin({ code, maths }) {
  const used = new Map()
  /** A component's local name, noting that the file uses it. */
  function use(name, path) {
    used.set(name, path)
    return name
  }
  return {
    name: 'rkui-mdx',
    ...(code && {
      code: (node) => ({
        type: 'mdxJsxFlowElement',
        name: use('RkuiCodeBlock', CODE_BLOCK),
        attributes: codeAttributes(node, code === true ? {} : code),
        // A string expression, so the code keeps its white space exactly.
        children: [{ type: 'mdxFlowExpression', value: JSON.stringify(node.value) }],
      }),
    }),
    ...(maths && {
      inlineMath: (node) => ({
        type: 'mdxJsxTextElement',
        name: use('RkuiMaths', MATHS),
        attributes: [attribute('tex', node.value)],
        children: [],
      }),
      math: (node) => ({
        type: 'mdxJsxFlowElement',
        name: use('RkuiEquation', EQUATION),
        attributes: [attribute('tex', node.value)],
        children: [],
      }),
    }),
    after(root, ctx) {
      const imports = [...used].map(([name, path]) => `import ${name} from '${path}'`)
      if (imports.length) ctx.prependChild(root, { type: 'mdxjsEsm', value: imports.join('\n') })
    },
  }
}

/**
 * A Vite plugin that warns, once, when an `.mdx` file compiles without rkui's plugin: when
 * `mdx({ extendMarkdownConfig: false })` or `mdx({ processor })` gives MDX a processor of its own.
 * MDX keeps its options to itself, so this shows only as the files compile. `seen` holds the
 * files rkui's plugin ran on.
 */
function mdxCheck(seen, logger) {
  let warned = false
  return {
    name: 'rkui-mdx-check',
    transform: {
      filter: { id: /\.mdx$/ },
      handler(code, id) {
        if (warned || seen.has(pathToFileURL(id).href)) return
        warned = true
        logger.warn(
          `${id} compiled without rkui's plugin, so fenced code and $…$ maths in MDX stay as ` +
            "Markdown has them. MDX isn't using markdown.processor: remove extendMarkdownConfig " +
            'and processor from mdx(), and give their plugins to markdown.processor instead.',
        )
      },
    },
  }
}

/** For a `.md` file, which the integration leaves alone: maths written in dollars stays text. */
const markdownDollars = {
  name: 'rkui-markdown-dollars',
  options: { position: true },
  inlineMath: (node, ctx) => ({ type: 'text', value: source(node, ctx) }),
  math: (node, ctx) => ({
    type: 'paragraph',
    children: [{ type: 'text', value: source(node, ctx) }],
  }),
}

/** The text a node was written as. */
function source(node, ctx) {
  return ctx.source.slice(node.position.start.offset, node.position.end.offset)
}

/**
 * Sets up the Markdown plugin: only with MDX in the site, and only with Sätteri, which a site may
 * have swapped for another processor. Never throws; says why it skipped when MDX is there.
 */
function setupMarkdown({ config, logger, updateConfig, code, maths }) {
  if (!config.integrations.some((integration) => integration.name === '@astrojs/mdx')) return
  const { processor } = config.markdown
  if (processor.name !== 'satteri') {
    logger.warn(
      `markdown.processor is ${processor.name}, so fenced code and $…$ maths in MDX stay as ` +
        "Markdown has them: rkui's plugin needs Sätteri. Set code and maths to false to silence this.",
    )
    return
  }
  const { options } = processor
  // Unless the site already parses maths in its .md files.
  const keepDollars = maths && !options.features.math
  if (maths) options.features.math = true
  const seen = new Set()
  options.mdastPlugins.push(({ sourceFormat, fileURL }) => {
    if (sourceFormat !== 'mdx') return keepDollars && markdownDollars
    if (fileURL) seen.add(fileURL.href)
    return mdxPlugin({ code, maths })
  })
  updateConfig({ vite: { plugins: [mdxCheck(seen, logger)] } })
}

/**
 * The integration. Each option is on when left out.
 * - `code`: true, false, or the attributes every fence's CodeBlock gets, such as
 *   `{ copy: 'hover', editor: true }`; `maths`: true or false.
 * - `vite`: the Vite settings the library needs; true, false or which to turn off.
 * - `licences`: true writes `rkui-licences.txt` to the build output, a string names the file.
 * - `head`: the page head's table mark (for tables and animated stats), stylesheet and enhance
 *   scripts; true, false or which to turn off.
 * - `settings`: the site's global settings: true, false, or the fixed settings and the
 *   `switchable` list, such as `{ palette: 'slate', switchable: ['theme', 'shadow'] }`. Fixed
 *   settings are written on every page's `<html>` by a middleware (`bakeFixedSettings()`); the
 *   switchable ones are put back from a reader's choice by a head script. True only puts back the
 *   theme; false, or an empty `switchable`, injects no script.
 */
export default function rkui({
  code = true,
  maths = true,
  vite = true,
  licences = true,
  head = true,
  settings = true,
} = {}) {
  return {
    name: '@oneonefour/rkui',
    hooks: {
      'astro:config:setup': async (hooks) => {
        const { config, logger, updateConfig, injectScript } = hooks
        if (code || maths) setupMarkdown({ config, logger, updateConfig, code, maths })
        if (vite) updateConfig({ vite: viteSettings(config, vite, logger) })
        const { switchable, fixed } = checkedSettings(settings)
        bakeFixedSettings(hooks, fixed)
        await injectHead(injectScript, head, switchable, logger)
      },
      'astro:build:done': async ({ dir, logger }) => {
        if (!licences) return
        const name = licences === true ? 'rkui-licences.txt' : licences
        await writeLicences(dir, name)
        logger.info(`wrote ${name}`)
      },
    },
  }
}
