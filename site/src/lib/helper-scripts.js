/**
 * The library's helper scripts (src/**\/*-enhance.js), for the badges on a component's page: the
 * components each one serves. Keep each list in step with the CSS its script serves; the build
 * stops if a helper script is missing here.
 */
const HELPERS = {
  // The focus band on radio groups, in Safari (interactive.css).
  'interactive-enhance.js': [
    'Ballot',
    'ChipGroup',
    'ColorPicker',
    'Folder',
    'Radio',
    'Segmented',
    'ThemeToggle',
    'Tiles',
  ],
  // An Alert's opening and closing buttons, and closedby="none", in Safari before 26.2.
  'alert-enhance.js': ['Alert'],
  // A drawer's close animation, in Safari (drawer.css), and Escape to shut a remote drawer.
  'drawer-enhance.js': ['Cabinet', 'Drawer'],
  // The chosen files' names inside a drop panel, cleared when its form is reset.
  'file-enhance.js': ['File'],
  // A folder strip's bar while its tabs don't fit, and how many tabs a collapsing strip shows.
  'folder-enhance.js': ['Folder', 'Pagination'],
  // The "more" dots on scroll regions, without scroll-driven animations (overflow.css): Safari
  // before 26 and Firefox before 159.
  'overflow-enhance.js': [
    'CodeBlock',
    'Equation',
    'Folder',
    'Pagination',
    'Scroll',
    'Table',
    'TopBarNav',
  ],
  // Sets a quote under three lines a step larger.
  'quote-enhance.js': ['Quote'],
  // Opens a sidebar scrolled to its current page, without scroll-initial-target (Safari and
  // Firefox).
  'sidebar-enhance.js': ['Sidebar'],
  // Counts a stat's numbers up when it scrolls into view.
  'stat-enhance.js': ['Stat'],
  // A table's entrance, and its header band's measurements.
  'table-enhance.js': ['Table'],
  // Escape to hide an open tooltip.
  'tooltip-enhance.js': ['Tooltip'],
  // Opens a top bar's narrow-screen line of page links scrolled to the current page's link.
  'topbar-nav-enhance.js': ['TopBarNav'],
}

// Only the file names are read, to check the list above; nothing is imported.
for (const path of Object.keys(import.meta.glob('../../../src/**/*-enhance.js'))) {
  const name = path.slice(path.lastIndexOf('/') + 1)
  if (!(name in HELPERS)) throw new Error(`site/src/lib/helper-scripts.js doesn't list ${name}`)
}

/**
 * The helper scripts a component uses, e.g. 'Table' → ['overflow-enhance.js', 'table-enhance.js'].
 * @param {string} component the component's name
 * @returns {string[]}
 */
export function helpersFor(component) {
  return Object.keys(HELPERS).filter((script) => HELPERS[script].includes(component))
}
