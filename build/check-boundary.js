// Fails the build if a .css or .js file under src/ imports a .astro file or anything from `astro`.
// Astro components may import the scripts and styles beside them, never the other way round.
import { glob, readFile } from 'node:fs/promises'

const FRAMEWORK_IMPORT =
  /(?:from|import)\s*\(?\s*['"](?:[^'"]*\.astro|astro(?::[^'"]*|\/[^'"]*)?)['"]/
const offenders = []

for (const pattern of ['**/*.css', '**/*.js']) {
  for await (const file of glob(pattern, { cwd: new URL('../src/', import.meta.url) })) {
    const source = await readFile(new URL(`../src/${file}`, import.meta.url), 'utf8')
    if (FRAMEWORK_IMPORT.test(source) || /@import\s+['"][^'"]*\.astro['"]/.test(source)) {
      offenders.push(`src/${file}`)
    }
  }
}

if (offenders.length > 0) {
  throw new Error(
    `These files import Astro, which src/ .css and .js files must not:\n${offenders.join('\n')}`,
  )
}
console.log('boundary: no .css or .js under src/ imports Astro')
