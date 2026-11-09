/**
 * The library components that run in the browser, so an Astro page gives them `client:visible`.
 * Each one's header comment says so. Keep this list in step with them.
 */
const INTERACTIVE = new Set(['Clock', 'CodeBlock', 'Dial', 'Stepper', 'ThemeToggle'])

/**
 * Whether an Astro page gives a library component `client:visible`. A Range needs it only with
 * `ticks` or `value-display`, whose thumb moves or shows the value in the browser, a ColorPicker
 * only with `custom`, whose colour input checks its tile in the browser, and a CodeBlock only with
 * its copy button, which `copy="never"` leaves out.
 * @param {string} component the component's name, e.g. 'Stepper'
 * @param {Record<string, string>} attributes the attributes the page gives it, each with its
 *   value as written: `custom` as '', `copy="never"` as 'never'
 * @returns {boolean}
 */
export function needsClientVisible(component, attributes) {
  if (component === 'Range') return 'ticks' in attributes || 'value-display' in attributes
  if (component === 'ColorPicker') return 'custom' in attributes
  if (component === 'CodeBlock') return attributes.copy !== 'never'
  return INTERACTIVE.has(component)
}

/**
 * When a component needs `client:visible`, for its page's badge: '' when it always does, the
 * options that need it ('with ticks or value-display'), or undefined when it never does. Keep it
 * in step with needsClientVisible() above.
 * @param {string} component the component's name, e.g. 'Range'
 * @returns {string | undefined}
 */
export function clientVisibleWhen(component) {
  if (component === 'Range') return 'with ticks or value-display'
  if (component === 'ColorPicker') return 'with custom'
  if (component === 'CodeBlock') return 'unless copy="never"'
  return INTERACTIVE.has(component) ? '' : undefined
}
