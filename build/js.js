// Bundles every custom element in src/components/ into one minified ES module, dist/rkui.js, for
// plain-HTML sites: <script type="module" src="rkui.js">. The elements are the *-element.ts files
// that register a Vue component as an element (shared/define-element.ts), which bring the Vue
// runtime with them. src/enhance.js joins them, with every helper script (*-enhance.js); the build
// fails if one under src/ is missing from its list. The module also exports the settings API
// (settings.js), so a plain page imports it from the same file.
import { glob, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build } from 'rolldown'

const SRC = fileURLToPath(new URL('../src/', import.meta.url))
const COMPONENTS = path.join(SRC, 'components')

/** Fails if a *-enhance.js under src/ isn't imported by src/enhance.js; returns how many there are. */
async function checkEnhanceList() {
  const list = await readFile(path.join(SRC, 'enhance.js'), 'utf8')
  const imported = new Set(
    [...list.matchAll(/^import '\.\/(.+)'$/gm)].map(([, file]) => path.normalize(file)),
  )
  const missing = []
  for await (const file of glob('**/*-enhance.js', { cwd: SRC })) {
    if (!imported.has(path.normalize(file))) missing.push(`src/${file}`)
  }
  if (missing.length > 0) {
    throw new Error(`src/enhance.js doesn't import these enhance scripts:\n${missing.join('\n')}`)
  }
  return imported.size
}

/** Writes dist/rkui.js. */
export async function buildJs() {
  const helperCount = await checkEnhanceList()
  const elementFiles = []
  for await (const file of glob('*/*-element.ts', { cwd: COMPONENTS })) {
    elementFiles.push(path.join(COMPONENTS, file))
  }
  const imports = [
    ...[path.join(SRC, 'enhance.js'), ...elementFiles.sort()].map(
      (file) => `import ${JSON.stringify(file)}`,
    ),
    `export * from ${JSON.stringify(path.join(SRC, 'settings.js'))}`,
  ].join('\n')

  await build({
    input: 'rkui-entry',
    plugins: [
      {
        name: 'rkui-entry',
        resolveId: (id) => (id === 'rkui-entry' ? '\0rkui-entry' : null),
        load: (id) => (id === '\0rkui-entry' ? imports : null),
      },
      vue(),
    ],
    // Vue's production build, without the Options API or devtools.
    transform: {
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.env.SSR': 'false',
        __VUE_OPTIONS_API__: 'false',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      },
    },
    output: {
      file: fileURLToPath(new URL('../dist/rkui.js', import.meta.url)),
      format: 'esm',
      minify: true,
    },
  })
  console.log(`dist/rkui.js: ${elementFiles.length} elements, ${helperCount} helper scripts`)
}
