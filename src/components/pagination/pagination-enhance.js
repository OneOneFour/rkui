/* Pagination's strip of tabs hides its own scrollbar, which would come between the tabs and the
   sheet (folder.css). This puts a thin bar above the tabs instead, in the room folder.css keeps
   for it: it shows while the tabs don't fit and stays scrolled to the same place as the strip.
   Without it, the strip still scrolls by touch, trackpad, wheel and keyboard. It handles
   Paginations added after the page loads too. */
import { eachElement } from '../../shared/each-element.js'

/** Each strip's bar, and each bar's strip. */
const partners = new WeakMap()
/** Where each scroller was last moved to by its partner. */
const movedTo = new WeakMap()

/** Shows the strip's bar while its tabs don't fit, scrolling exactly as far as the strip. */
const fit = (strip) => {
  const bar = partners.get(strip)
  const overflow = strip.scrollWidth - strip.clientWidth
  bar.hidden = overflow <= 0
  bar.firstElementChild.style.inlineSize = `calc(100% + ${overflow}px)`
}

const resized = new ResizeObserver((entries) => {
  for (const { target } of entries) fit(target.closest('.rkui-folder-tabs'))
})

// A strip is marked once it has its bar, so the script running twice adds no second one.
eachElement('.rkui-folder > nav > .rkui-folder-tabs', 'data-rkui-bar', (strip) => {
  const bar = document.createElement('div')
  bar.className = 'rkui-scroll rkui-scroll--bar rkui-folder-scrollbar'
  bar.setAttribute('aria-hidden', 'true')
  bar.tabIndex = -1
  bar.append(document.createElement('div'))
  strip.before(bar)
  partners.set(strip, bar).set(bar, strip)
  // The tabs too: a web font arriving widens them without resizing the strip.
  for (const element of [strip, ...strip.children]) resized.observe(element)
})

// Moving one scroller moves its partner, and the scroll event that move causes is ignored, so a
// scroll still in progress there (a fling) isn't pulled back.
document.addEventListener(
  'scroll',
  ({ target }) => {
    const partner = partners.get(target)
    if (!partner) return
    const expected = movedTo.get(target)
    if (expected !== undefined && Math.abs(target.scrollLeft - expected) < 1) return
    movedTo.set(partner, target.scrollLeft)
    partner.scrollLeft = target.scrollLeft
  },
  { capture: true, passive: true },
)
