// Bundles every custom element in src/components/ (the .js files that call customElements.define) into one
// minified ES module, dist/rkui.js, for plain-HTML sites: <script type="module" src="rkui.js">.
import { glob, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'rolldown'

const COMPONENTS = fileURLToPath(new URL('../src/components/', import.meta.url))

/** Writes dist/rkui.js. */
export async function buildJs() {
  const elementFiles = []
  for await (const file of glob('*/*.js', { cwd: COMPONENTS })) {
    if ((await readFile(path.join(COMPONENTS, file), 'utf8')).includes('customElements.define(')) {
      elementFiles.push(path.join(COMPONENTS, file))
    }
  }
  const imports = elementFiles
    .sort()
    .map((file) => `import ${JSON.stringify(file)}`)
    .join('\n')

  await build({
    input: 'rkui-entry',
    plugins: [
      {
        name: 'rkui-entry',
        resolveId: (id) => (id === 'rkui-entry' ? '\0rkui-entry' : null),
        load: (id) => (id === '\0rkui-entry' ? imports : null),
      },
    ],
    output: {
      file: fileURLToPath(new URL('../dist/rkui.js', import.meta.url)),
      format: 'esm',
      minify: true,
    },
  })
  console.log(`dist/rkui.js: ${elementFiles.length} elements`)
}
