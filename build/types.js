// Writes .d.ts files for src/components/ and src/shared/ into dist/types/, from their JSDoc.
import { execFileSync } from 'node:child_process'
import { globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../', import.meta.url))

/** Every .js file under src/components/ and src/shared/, as paths relative to the repo root. */
function sourceFiles() {
  return ['src/components/**/*.js', 'src/shared/*.js'].flatMap((pattern) =>
    globSync(pattern, { cwd: ROOT }).sort(),
  )
}

/** Runs `tsc` over the component and shared scripts. */
export async function buildTypes() {
  const options = [
    '--allowJs',
    '--declaration',
    '--emitDeclarationOnly',
    '--skipLibCheck',
    ...['--target', 'es2022', '--module', 'esnext', '--moduleResolution', 'bundler'],
    ...['--lib', 'es2022,dom,dom.iterable'],
    ...['--rootDir', 'src', '--outDir', 'dist/types'],
  ]
  execFileSync('npx', ['tsc', ...options, ...sourceFiles()], { cwd: ROOT, stdio: 'inherit' })
  console.log('dist/types: .d.ts for components/ and shared/')
}
