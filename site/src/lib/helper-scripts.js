/**
 * The library's helper scripts (src/**\/*-enhance.js) and the components each one serves, for the
 * chip on a component's page. Keep each list in step with the CSS its script serves; the build
 * stops if a helper script is missing here.
 */
const SERVES = {
  // The focus band on radio groups, in Safari (interactive.css).
  'interactive-enhance.js': [
    'Ballot',
    'ChipGroup',
    'ColorPicker',
    'Radio',
    'Segmented',
    'Tabs',
    'ThemeToggle',
    'Tiles',
  ],
  // The "more" dots on scroll regions, without scroll-driven animations (overflow.css).
  'overflow-enhance.js': ['CodeBlock', 'Folder', 'Pagination', 'Scroll', 'Table', 'WidgetTabs'],
  'pagination-enhance.js': ['Pagination'],
  'sidebar-enhance.js': ['Sidebar'],
  'table-enhance.js': ['Table'],
  // Escape to hide an open tooltip.
  'tooltip-enhance.js': ['Tooltip'],
}

// Only the file names are read, to check the list above; nothing is imported.
for (const path of Object.keys(import.meta.glob('../../../src/**/*-enhance.js'))) {
  const name = path.slice(path.lastIndexOf('/') + 1)
  if (!(name in SERVES)) throw new Error(`site/src/lib/helper-scripts.js doesn't list ${name}`)
}

/**
 * The helper scripts a component uses, e.g. 'Table' → ['overflow-enhance.js', 'table-enhance.js'].
 * @param {string} component the component's name
 * @returns {string[]}
 */
export function helpersFor(component) {
  return Object.keys(SERVES).filter((script) => SERVES[script].includes(component))
}
