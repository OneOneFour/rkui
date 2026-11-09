/**
 * rkui's Astro integration: in MDX files, a fenced code block renders as `CodeBlock`, `$…$` as
 * `Maths` and `$$…$$` as `Equation`, with no tags to write.
 *
 *   // astro.config.mjs
 *   import mdx from '@astrojs/mdx'
 *   import vue from '@astrojs/vue'
 *   import rkui from '@oneonefour/rkui/astro'
 *   export default defineConfig({ integrations: [mdx(), vue(), rkui()] })
 *
 * It adds a plugin to Sätteri, Astro's Markdown processor, on `markdown.processor`, which MDX
 * inherits: options given to `mdx({ processor })` instead are out of its reach. `.md` files are
 * left as they were, dollars included.
 */

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
 * The integration. `code` is true, false, or the attributes every fence's CodeBlock gets, such as
 * `{ copy: 'hover', editor: true }`; `maths` is true or false. Both are true when left out.
 */
export default function rkui({ code = true, maths = true } = {}) {
  return {
    name: '@oneonefour/rkui',
    hooks: {
      'astro:config:setup': ({ config }) => {
        const { processor } = config.markdown
        if (processor.name !== 'satteri') {
          throw new Error(
            `rkui(): markdown.processor is ${processor.name}; the integration needs Sätteri`,
          )
        }
        const { options } = processor
        // Unless the site already parses maths in its .md files.
        const keepDollars = maths && !options.features.math
        if (maths) options.features.math = true
        options.mdastPlugins.push(({ sourceFormat }) =>
          sourceFormat === 'mdx' ? mdxPlugin({ code, maths }) : keepDollars && markdownDollars,
        )
      },
    },
  }
}
