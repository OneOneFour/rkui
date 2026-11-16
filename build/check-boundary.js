// Fails the build if a file under src/ imports a framework it mustn't. No .css or .js file imports
// a framework (a .astro or .vue file, or anything from `astro` or `vue`): components may import
// the scripts and styles beside them, never the other way round, so the CSS and the plain scripts
// work in any page. Of the .ts files, only the helpers that work with Vue (VUE_HELPERS) and the
// *-element.ts registrations may import Vue, and none imports Astro. There are no .astro files
// under src/, and custom elements are only registered through define-element.ts, from a Vue
// component, never written by hand.
import { glob, readFile } from 'node:fs/promises'

const FRAMEWORK_IMPORT =
  /(?:from|import)\s*\(?\s*['"](?:[^'"]*\.(?:astro|vue)|(?:astro|vue)(?::[^'"]*|\/[^'"]*)?)['"]/
const ASTRO_IMPORT = /(?:from|import)\s*\(?\s*['"](?:[^'"]*\.astro|astro(?::[^'"]*|\/[^'"]*)?)['"]/
const CSS_FRAMEWORK_IMPORT = /@import\s+['"][^'"]*\.(?:astro|vue)['"]/

/** The .ts files, under src/, that may import Vue. */
const VUE_HELPERS = new Set([
  'components/folder/tab-slot.ts',
  'shared/component-id.ts',
  'shared/define-element.ts',
  'shared/live.ts',
  'shared/model-start.ts',
  'shared/option-slot.ts',
  'shared/slot-html.ts',
])

/** Whether `file` (relative to src/, with source `source`) imports a framework it mustn't. */
function crossesBoundary(file, source) {
  if (file.endsWith('.ts') && (VUE_HELPERS.has(file) || file.endsWith('-element.ts'))) {
    return ASTRO_IMPORT.test(source)
  }
  return FRAMEWORK_IMPORT.test(source) || CSS_FRAMEWORK_IMPORT.test(source)
}

const src = new URL('../src/', import.meta.url)
const offenders = []
for await (const file of glob('**/*.{css,js,ts}', { cwd: src })) {
  const source = await readFile(new URL(file, src), 'utf8')
  if (crossesBoundary(file, source)) offenders.push(`src/${file}`)
  if (file !== 'shared/define-element.ts' && source.includes('customElements.define')) {
    offenders.push(`src/${file} (registers a custom element by hand; use defineElement)`)
  }
}
for await (const file of glob('**/*.astro', { cwd: src })) {
  offenders.push(`src/${file} (an Astro component; components are .vue)`)
}

if (offenders.length > 0) {
  throw new Error(
    `These files break the library boundary (build/check-boundary.js):\n${offenders.join('\n')}`,
  )
}
console.log('boundary: no file under src/ imports a framework it must not, and no .astro files')
