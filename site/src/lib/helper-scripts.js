/**
 * The library's helper scripts (src/**\/*-enhance.js), for the badges on a component's page: what
 * each one does, in a few words, the one browser it matters in (if only one), and the components
 * it serves. Keep each list in step with the CSS its script serves; the build stops if a helper
 * script is missing here.
 */
const HELPERS = {
  // The focus band on radio groups, in Safari (interactive.css).
  'interactive-enhance.js': {
    label: 'Safari focus fix',
    browser: 'safari',
    serves: [
      'Ballot',
      'ChipGroup',
      'ColorPicker',
      'Folder',
      'Radio',
      'Segmented',
      'ThemeToggle',
      'Tiles',
    ],
  },
  // An Alert's opening and closing buttons, and closedby="none", in Safari before 26.2.
  'alert-enhance.js': { label: 'Safari dialog fix', browser: 'safari', serves: ['Alert'] },
  // A drawer's close animation, in Safari (drawer.css).
  'drawer-enhance.js': {
    label: 'Safari close animation',
    browser: 'safari',
    serves: ['Cabinet', 'Drawer'],
  },
  // The chosen file's name inside a drop panel.
  'file-enhance.js': { label: 'Shows the file name', serves: ['File'] },
  // A folder strip's bar while its tabs don't fit, and how many tabs a collapsing strip shows.
  'folder-enhance.js': { label: 'Strip bar and collapse', serves: ['Folder', 'Pagination'] },
  // The "more" dots on scroll regions, without scroll-driven animations (overflow.css): Safari
  // before 26 and Firefox before 159.
  'overflow-enhance.js': {
    label: 'Scroll dots in older browsers',
    serves: ['CodeBlock', 'Folder', 'Pagination', 'Scroll', 'Table'],
  },
  // Sets a quote under three lines a step larger.
  'quote-enhance.js': { label: 'Short quotes larger', serves: ['Quote'] },
  // Opens a sidebar scrolled to its current page, without scroll-initial-target (Safari and
  // Firefox).
  'sidebar-enhance.js': { label: 'Scrolls to the current page', serves: ['Sidebar'] },
  // A table's entrance, and its header band's measurements.
  'table-enhance.js': { label: 'Table entrance', serves: ['Table'] },
  // Escape to hide an open tooltip.
  'tooltip-enhance.js': { label: 'Escape hides it', serves: ['Tooltip'] },
}

// Only the file names are read, to check the list above; nothing is imported.
for (const path of Object.keys(import.meta.glob('../../../src/**/*-enhance.js'))) {
  const name = path.slice(path.lastIndexOf('/') + 1)
  if (!(name in HELPERS)) throw new Error(`site/src/lib/helper-scripts.js doesn't list ${name}`)
}

/**
 * The helper scripts a component uses, e.g. 'Table' → the entries for overflow-enhance.js and
 * table-enhance.js.
 * @param {string} component the component's name
 * @returns {{ script: string, label: string, browser?: string }[]}
 */
export function helpersFor(component) {
  return Object.entries(HELPERS)
    .filter(([, helper]) => helper.serves.includes(component))
    .map(([script, { label, browser }]) => ({ script, label, browser }))
}
