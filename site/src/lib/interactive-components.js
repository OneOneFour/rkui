/**
 * The library components that run in the browser, so an Astro page gives them `client:visible`.
 * Each one's header comment says so. Keep this list in step with them.
 */
const INTERACTIVE = new Set(['Clock', 'CodeBlock', 'Dial', 'Stepper', 'ThemeToggle', 'WidgetTabs'])

/**
 * Whether an Astro page gives a library component `client:visible`. A Range needs it only with
 * `readout`, which follows the slider in the browser, a ColorPicker only with `custom`, whose
 * colour input checks its tile in the browser, and a CodeBlock only with its copy button, which
 * `:copy="false"` leaves out.
 * @param {string} component the component's name, e.g. 'Stepper'
 * @param {Record<string, string>} attributes the attributes the page gives it, each with its
 *   value as written: `readout` as '', `:copy="false"` as 'false'
 * @returns {boolean}
 */
export function needsClientVisible(component, attributes) {
  if (component === 'Range') return 'readout' in attributes
  if (component === 'ColorPicker') return 'custom' in attributes
  if (component === 'CodeBlock') return attributes.copy !== 'false'
  return INTERACTIVE.has(component)
}
