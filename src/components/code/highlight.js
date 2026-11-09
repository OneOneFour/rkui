// Syntax highlighting for CodeBlock, run on the server only. Shiki's css-variables theme paints each
// token with var(--rkui-shiki-token-*), which code.css maps onto the --rkui-code-* colour tokens.
import { bundledLanguages, createCssVariablesTheme, getSingletonHighlighter } from 'shiki'

const theme = createCssVariablesTheme({ name: 'css-variables', variablePrefix: '--rkui-shiki-' })

/**
 * A Shiki transformer that keeps only what goes inside the `<code>`: the highlighted lines.
 * @type {import('shiki').ShikiTransformer}
 */
const linesOnly = {
  root(root) {
    const pre = root.children[0]
    const code = pre?.type === 'element' ? pre.children[0] : undefined
    return { type: 'root', children: code?.type === 'element' ? code.children : [] }
  },
}

/**
 * The Shiki language `lang` and the ones it may hold that Shiki only loads when asked, such as
 * the languages of a Markdown file's fenced code. None for a language Shiki doesn't know.
 *
 * @param {string} lang
 * @returns {Promise<string[]>}
 */
async function languagesFor(lang) {
  if (!(lang in bundledLanguages)) return []
  const { default: grammars } = await bundledLanguages[lang]()
  const embedded = grammars.flatMap((grammar) => grammar.embeddedLangsLazy ?? [])
  return [lang, ...embedded.filter((name) => name in bundledLanguages)]
}

/**
 * Loads Shiki and the language `lang`, and returns a function that highlights code in it (as
 * plain text for a language Shiki doesn't know), at once, as the HTML that goes inside its
 * `<code>`. CodeBlock loads it before it renders, and highlights its slot's text as it renders.
 *
 * @param {string} lang
 * @returns {Promise<(code: string) => string>}
 */
export async function highlighter(lang) {
  const langs = await languagesFor(lang)
  const shiki = await getSingletonHighlighter({ themes: [theme], langs })
  const known = langs.length ? lang : 'plaintext'
  return (code) => shiki.codeToHtml(code, { lang: known, theme, transformers: [linesOnly] })
}
