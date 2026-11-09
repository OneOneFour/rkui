// Plays each table's entrance once, the first time the table is seen (table.css): a table out of
// view is marked "waiting", and when it comes into view "arrived". A table already in view when
// the page loads is "arrived" too if the page carries table-init.js's mark, which kept its values
// hidden; without the mark it may have shown them already, so it is "on-load" and only draws its
// rules. The mark comes off once the first tables have their state, or after table-init.js's
// timeout. Tables added later are handled the same way, so a Vue app's tables, drawn while the
// mark is still on, play in full. It also gives each header cell its share of the band, which the
// band's fill needs. Under reduced motion it does nothing, and everything just shows. A still
// table (.rkui-table--still) is left alone. It comes in rkui.js.
import { eachElement } from '../../shared/each-element.js'

/**
 * Sets each header cell's start and end, as fractions of the band's width.
 * @param {Element} table
 */
function measureBand(table) {
  /** @type {HTMLElement[]} */
  const cells = [...table.querySelectorAll('thead tr:first-child > th')]
  if (cells.length === 0) return
  const start = cells[0].offsetLeft
  const width = cells.at(-1).offsetLeft + cells.at(-1).offsetWidth - start
  for (const cell of cells) {
    cell.style.setProperty('--rkui-table-band-start', String((cell.offsetLeft - start) / width))
    cell.style.setProperty(
      '--rkui-table-band-end',
      String((cell.offsetLeft + cell.offsetWidth - start) / width),
    )
  }
}

if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const root = document.documentElement
  // A table counts as seen once it is a tenth of the window's height above the bottom edge, so
  // one barely in view doesn't play its entrance mostly out of sight.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        const table = /** @type {HTMLElement} */ (target)
        if (!isIntersecting) {
          table.dataset.rkuiEntrance = 'waiting'
          continue
        }
        if (table.dataset.rkuiEntrance === 'waiting' || root.dataset.rkuiTables === 'pending') {
          measureBand(table)
          table.dataset.rkuiEntrance = 'arrived'
        } else {
          table.dataset.rkuiEntrance = 'on-load'
        }
        observer.unobserve(table)
      }
      delete root.dataset.rkuiTables
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  eachElement('.rkui-table:not(.rkui-table--still)', 'data-rkui-table-watched', (table) =>
    observer.observe(table),
  )
}
