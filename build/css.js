// Bundles src/index.css into one minified dist/rkui.css, and copies the fonts beside
// it. Targets are the browsers that support light-dark(), so it, @scope and color-mix() pass
// through unchanged.
import { cp, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { bundle, browserslistToTargets } from 'lightningcss'

const ENTRY = fileURLToPath(new URL('../src/index.css', import.meta.url))
const FONTS_SRC = new URL('../src/fonts/', import.meta.url)
const SRC_DIR = fileURLToPath(new URL('../src/', import.meta.url))
const OUT_DIR = fileURLToPath(new URL('../dist/', import.meta.url))

const TARGETS = browserslistToTargets(['chrome 123', 'edge 123', 'firefox 120', 'safari 17.5'])

/**
 * Lightning CSS leaves url() paths relative to the file they were written in, which breaks once
 * the files are bundled. This points each one at the same font in dist/fonts/.
 */
function rebaseUrls(code, dependencies) {
  for (const dependency of dependencies) {
    if (dependency.type !== 'url') continue
    if (dependency.url.startsWith('data:')) {
      code = code.replaceAll(dependency.placeholder, dependency.url)
      continue
    }
    const source = path.resolve(path.dirname(dependency.loc.filePath), dependency.url)
    const fromDist = path.relative(OUT_DIR, source.replace(SRC_DIR, OUT_DIR))
    code = code.replaceAll(dependency.placeholder, fromDist)
  }
  return code
}

/** Writes dist/rkui.css and dist/fonts/. */
export async function buildCss() {
  const { code, dependencies } = bundle({
    filename: ENTRY,
    minify: true,
    targets: TARGETS,
    analyzeDependencies: true,
  })
  const css = rebaseUrls(code.toString(), dependencies)

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(path.join(OUT_DIR, 'rkui.css'), css)
  await cp(FONTS_SRC, new URL('fonts/', `file://${OUT_DIR}`), { recursive: true })
  console.log(`dist/rkui.css: ${(css.length / 1024).toFixed(0)} KB, fonts copied`)
}
