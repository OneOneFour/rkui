// TeX to KaTeX's HTML, for Equation and Maths. KaTeX is an optional peer dependency: a site that
// uses the maths components installs it, and loads its stylesheet before rkui's.
import katex from 'katex'
import type { Hue } from '../../shared/hues'

/** The hues with a term class in maths.css; each has a `\<hue>{…}` macro for a colour-coded term. */
export const TERM_HUES: Hue[] = [
  'teal',
  'yellow',
  'navy',
  'green',
  'sky',
  'coral',
  'grape',
  'tangerine',
  'lilac',
  'apricot',
]

const termMacros = Object.fromEntries(
  TERM_HUES.map((hue) => [`\\${hue}`, `\\htmlClass{rkui-maths-${hue}}{#1}`]),
)

/** KaTeX may only write same-page links (equation references) and rkui-maths-* classes. */
function trust(context: { command: string; url?: string; class?: string }): boolean {
  if (context.command === '\\href') return context.url?.startsWith('#') ?? false
  if (context.command === '\\htmlClass') return context.class?.startsWith('rkui-maths-') ?? false
  return false
}

/**
 * Renders TeX to KaTeX's HTML, with MathML for screen readers. A TeX error throws, which stops
 * the build.
 */
export function renderMaths(tex: string, display: boolean): string {
  return katex.renderToString(tex, {
    displayMode: display,
    output: 'htmlAndMathml',
    throwOnError: true,
    trust,
    // \htmlClass is a KaTeX extension, which strict mode would warn about.
    strict: (code: string) => (code === 'htmlExtension' ? 'ignore' : 'warn'),
    macros: termMacros,
  })
}
