// Syntax highlighting for CodeBlock, run on the server only. Shiki's css-variables theme paints each
// token with var(--rkui-shiki-token-*), which code.css maps onto the --rkui-code-* colour tokens.
import { bundledLanguages, codeToHtml, createCssVariablesTheme } from 'shiki'

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
 * Highlights `code` as the Shiki language `lang` (plain text for a language Shiki doesn't know),
 * and returns the HTML that goes inside its `<code>`. A final line break is dropped.
 *
 * @param {string} code
 * @param {string} lang
 * @returns {Promise<string>}
 */
export function highlight(code, lang) {
  return codeToHtml(code.replace(/(?:\r\n|\r|\n)$/, ''), {
    lang: lang in bundledLanguages ? lang : 'plaintext',
    theme,
    transformers: [linesOnly],
  })
}
