/**
 * Checks that a demo imports each library component under its own file name, as in
 * `import Stepper from '@oneonefour/rkui/components/number/Stepper.vue'`. The docs find a
 * component by the name its template uses: whether it runs in the browser, and whether it has a
 * custom element. A demo that imports one under another name stops the build.
 * @param {string} code the demo's code: a `.vue` file, or an inline demo's Astro source
 */
export function checkImportNames(code) {
  const imports = code.matchAll(
    /^import (\w+) from ['"]@oneonefour\/rkui\/components\/[\w-]+\/(\w+)\.vue['"]/gm,
  )
  for (const [, name, file] of imports) {
    if (name !== file) throw new Error(`It imports ${file}.vue as ${name}; import it as ${file}`)
  }
}
