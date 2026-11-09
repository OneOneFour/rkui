/**
 * An MDX plugin that gives each `<Demo>` written inline its source. The demo's children are the
 * code it shows, written as an Astro page writes them:
 *
 *   <Demo label="Button hues">
 *     <Button>Yellow</Button>
 *     <Button hue="navy">Navy</Button>
 *   </Demo>
 *
 * The plugin copies the text between `<Demo …>` and `</Demo>` from the page, dedented, into the
 * Demo's `astro` prop, after the page's imports for what it uses, as an Astro page's frontmatter.
 * A Demo given a `.vue` file's text as `vue` is left alone.
 *
 * The children are code, not Markdown, so the plugin keeps Markdown out of them: a line of text
 * and tags is a paragraph to MDX, which the plugin unwraps, as Astro writes no `<p>` for it. These
 * stop the build, naming the demo, because the tabs could not show them truly:
 * - Markdown, or text that Markdown changed (smart quotes, dashes, escapes);
 * - text and a tag, or two texts, on separate lines: as in JSX, they run together with no space,
 *   so put them on one line, or end the line with `{' '}`;
 * - a `{/* comment *\/}`, which has no form in a Vue template.
 *
 * It runs in Sätteri, the Markdown processor Astro uses for MDX, as one of its mdast plugins
 * (`satteri({ mdastPlugins })`).
 */

/** The Markdown node types a demo may hold: tags, `{expressions}` and the text between them. */
const CODE_NODES = new Set([
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxFlowExpression',
  'mdxTextExpression',
  'paragraph',
  'text',
])

/** The text with each run of white space as one space, for comparing text with its source. */
function collapse(text) {
  return text.replace(/\s+/g, ' ').trim()
}

/** The text with the indentation its lines share removed. */
function dedent(text) {
  const lines = text.split('\n')
  const indents = lines.filter((line) => line.trim()).map((line) => line.match(/^ */)[0].length)
  const shared = Math.min(...indents)
  return lines.map((line) => line.slice(shared)).join('\n')
}

/**
 * Nodes with each paragraph among them, at any depth, replaced by what it holds. MDX makes a
 * paragraph of a line of text and tags, which Astro and Vue write as they are.
 * @param {object[]} nodes mdast nodes
 * @returns {object[]} copies of the nodes
 */
export function flattenParagraphs(nodes) {
  return nodes.flatMap((node) => {
    const children = node.children && flattenParagraphs(node.children)
    return node.type === 'paragraph' ? children : [{ ...node, ...(children && { children }) }]
  })
}

/** Whether a node is an `{expression}` holding only a comment. */
function isComment(node) {
  return node.type.endsWith('Expression') && !node.value.replace(/\/\*[\s\S]*?\*\//g, '').trim()
}

/** Throws if a demo's nodes hold something its tabs can't show truly (see the file comment). */
function checkCode(nodes, source) {
  nodes.forEach((node, index) => {
    const text = source.slice(node.position.start.offset, node.position.end.offset)
    if (!CODE_NODES.has(node.type)) {
      throw new Error(`It holds Markdown (${node.type}); write it as HTML`)
    }
    if (node.type === 'text' && collapse(node.value) !== collapse(text)) {
      throw new Error(`Markdown changed its text "${collapse(node.value)}"; keep it in a .vue file`)
    }
    if (isComment(node)) throw new Error(`A Vue template can't hold the comment ${text}`)
    const next = nodes[index + 1]
    const gap = next && source.slice(node.position.end.offset, next.position.start.offset)
    if (gap?.includes('\n') && (node.type === 'text' || next.type === 'text')) {
      throw new Error(
        `"${collapse(text)}" and the next line run together with no space; ` +
          "join the lines, or end the first with {' '}",
      )
    }
    if (node.children) checkCode(node.children, source)
  })
}

/** The names an import binds: `X` in `import X from`, and `a` and `c` in `{ a, b as c }`. */
function boundNames(statement) {
  const clause = statement.match(/^import\s+([\s\S]*?)\s+from\s/)?.[1] ?? ''
  return clause
    .replace(/[{}]/g, '')
    .split(',')
    .map((part) =>
      part
        .trim()
        .split(/\s+as\s+/)
        .at(-1),
    )
    .filter(Boolean)
}

/** The names a demo uses: its tags, and the words in its `{expressions}`. */
function usedNames(nodes) {
  return nodes.flatMap((node) => {
    const expressions = (node.attributes ?? []).map((attribute) => attribute.value?.value ?? '')
    if (node.type.endsWith('Expression')) expressions.push(node.value)
    const words = expressions.join(' ').match(/[\w$]+/g) ?? []
    return [node.name, ...words, ...usedNames(node.children ?? [])].filter(Boolean)
  })
}

/** The text of an attribute the Demo is given as a plain string, or undefined. */
function attribute(node, name) {
  const value = node.attributes.find((attribute) => attribute.name === name)?.value
  return typeof value === 'string' ? value : undefined
}

/** The plugin, made afresh for each page, as Sätteri does with a function in `mdastPlugins`. */
export function demoSource() {
  let pageImports = []
  return {
    name: 'rkui-demo-source',
    options: { position: true },
    before(root) {
      const esm = root.children.filter((node) => node.type === 'mdxjsEsm').map((node) => node.value)
      pageImports = esm.join('\n').match(/^import\s[^'"]*?\sfrom\s+(['"])[^'"]+\1/gm) ?? []
    },
    mdxJsxFlowElement(node, ctx) {
      const given = node.attributes.some(({ name }) => name === 'vue' || name === 'astro')
      if (node.name !== 'Demo' || given) return
      const { source } = ctx
      const first = node.children[0]
      const last = node.children.at(-1)
      try {
        if (!first) throw new Error('It has nothing in it')
        checkCode(flattenParagraphs(node.children), source)
      } catch (error) {
        throw new Error(`Demo "${attribute(node, 'label')}": ${error.message}`)
      }
      // From the start of the first child's line, so that dedent sees its indentation.
      const lineStart = source.lastIndexOf('\n', first.position.start.offset) + 1
      const before = source.slice(lineStart, first.position.start.offset)
      const start = before.trim() ? first.position.start.offset : lineStart
      const body = dedent(source.slice(start, last.position.end.offset)).trim()
      const used = new Set(usedNames(node.children))
      const imports = pageImports.filter((line) => boundNames(line).some((name) => used.has(name)))
      const astro = imports.length ? `---\n${imports.join('\n')}\n---\n\n${body}` : body
      return {
        ...node,
        attributes: [...node.attributes, { type: 'mdxJsxAttribute', name: 'astro', value: astro }],
        children: flattenParagraphs(node.children),
      }
    },
  }
}
