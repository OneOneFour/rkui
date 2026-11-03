/** A page's own `style`: a string, or an object of CSS properties as Astro accepts. */
type StyleInput = string | object | undefined | null

/** Turns an object style into declarations; camelCase names become kebab-case, `--custom` stay. */
function objectToDeclarations(style: object): string[] {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([name, value]) => {
      const property = name.startsWith('--')
        ? name
        : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
      return `${property}: ${value}`
    })
}

/**
 * Joins custom property declarations (skipping unset ones) with a page's own `style`, which may be
 * a string or an object.
 */
export function styleVars(
  vars: Record<string, string | undefined>,
  style?: StyleInput,
): string | undefined {
  const own = Object.entries(vars)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name}: ${value}`)
  const pages =
    typeof style === 'string' ? (style ? [style] : []) : style ? objectToDeclarations(style) : []
  const all = [...own, ...pages]
  return all.length > 0 ? all.join('; ') : undefined
}
