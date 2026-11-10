/**
 * The library's token files (src/tokens/*.css), read when the site is built, so the Foundations
 * pages' tables can't drift from them.
 */
const files = import.meta.glob('../../../src/tokens/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** A token file's text, e.g. 'space' for src/tokens/space.css. */
function tokenFile(name) {
  const text = files[`../../../src/tokens/${name}.css`]
  if (text === undefined) throw new Error(`There is no src/tokens/${name}.css`)
  return text
}

/**
 * The tokens declared under one comment in a token file's `:root`, in order, e.g. 'Spacing' in
 * space.css → [{ name: '--rkui-space-1', value: '0.25rem' }, …]. The build stops if the file has
 * no such group.
 * @param {string} file the token file, e.g. 'space'
 * @param {string} group the comment above the group, e.g. 'Spacing'
 * @returns {{ name: string, value: string }[]}
 */
export function tokenGroup(file, group) {
  const tokens = []
  let current
  for (const line of tokenFile(file).split('\n')) {
    const comment = line.match(/^\s*\/\*\s*(.*?)\s*\*\/\s*$/)
    if (comment) current = comment[1]
    const token = line.match(/^\s*(--rkui-[\w-]+):\s*([^;]+);/)
    if (token && current === group) tokens.push({ name: token[1], value: token[2] })
  }
  if (!tokens.length) throw new Error(`src/tokens/${file}.css has no tokens under /* ${group} */`)
  return tokens
}

/**
 * The shadow lengths that grow with depth (shadows.css), each as it is at normal depth and deep:
 * every token written `calc(var(--rkui-shadow-depth) * <n>px)`, e.g.
 * { name: '--rkui-shadow-offset', normal: 4, deep: 6 }.
 * @returns {{ name: string, normal: number, deep: number }[]}
 */
export function depthLengths() {
  const text = tokenFile('shadows')
  const deep = Number(text.match(/\[data-depth='deep'\]\s*\{\s*--rkui-shadow-depth:\s*([\d.]+)/)[1])
  const lengths = []
  const pattern = /(--rkui-[\w-]+):\s*calc\(var\(--rkui-shadow-depth\) \* ([\d.]+)px\)/g
  for (const [, name, px] of text.matchAll(pattern)) {
    lengths.push({ name, normal: Number(px), deep: Number(px) * deep })
  }
  return lengths
}
