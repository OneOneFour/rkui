/* Two extras for folder strips (Folder, Pagination) and Pagination's tiles, which work without it.

   The bar: a folder strip hides its own scrollbar, which would come between the tabs and the
   sheet (folder.css). This shows the strip's thin bar on its outer side instead, only while the
   tabs don't fit, and keeps the two scrolled to the same place, across the strip or down it for
   tabs on the sides.

   Collapse: a collapsing strip shows as many tabs as fit. It always shows the first and last tabs,
   the chosen one and its neighbours, then adds tabs outwards from the chosen one, the one after it
   first and then alternating, each side until one more wouldn't fit; at an end all the room goes
   the other way. A "…" never stands for a single tab: that tab shows instead. When even the fewest
   don't fit, the strip goes to its small size, then shows only the chosen tab between the ‹ › step
   tabs (with no step tabs, between its neighbours), and only then scrolls. Without this script a
   collapsing strip scrolls.

   Either way it keeps the chosen tab in view while the strip scrolls. It handles strips added after
   the page loads too. */
import { eachElement } from '../../shared/each-element.js'

const STRIPS = '.rkui-folder-strip > .rkui-folder-tabs, .rkui-pagination-pages > .rkui-tiles'
const CHOSEN = ':checked, [aria-current="page"]'

/** Each strip's bar, and each bar's strip. */
const partners = new WeakMap()
/** Where each scroller was last moved to by its partner. */
const movedTo = new WeakMap()

const runsDown = (strip) => getComputedStyle(strip).writingMode.startsWith('vertical')

/** How far the strip's tabs reach past its end, across it or down it. */
const overflowOf = (strip) =>
  runsDown(strip) ? strip.scrollHeight - strip.clientHeight : strip.scrollWidth - strip.clientWidth

/** Whether the strip's own Folder or Pagination collapses, rather than one around it. */
const collapses = (strip) =>
  strip
    .closest('.rkui-folder, .rkui-pagination-tiles')
    .matches('.rkui-folder--collapse, .rkui-pagination-tiles--collapse')

/** Whether the strip has ‹ › step tabs, or a tiles Pagination its Previous and Next buttons. */
const hasSteps = (strip) =>
  Boolean(
    strip.querySelector(':scope > .rkui-folder-step, :scope > * > .rkui-folder-step') ??
    strip.closest('.rkui-pagination')?.querySelector(':scope > .rkui-button'),
  )

/**
 * Shows the items in `shown`, tucks those in `tucked` and hides the rest, with "…" for the gaps
 * beside the first and last items when they show.
 */
const showOnly = (items, shown, tucked = new Set()) => {
  const last = items.length - 1
  items.forEach((item, index) => {
    item.hidden = !shown.has(index) && !tucked.has(index)
    item.toggleAttribute('data-rkui-tucked', tucked.has(index))
  })
  const ends = shown.has(0) && shown.has(last)
  const gapAfterFirst = ends && !shown.has(1)
  const gapBeforeLast = ends && !shown.has(last - 1)
  items[0].querySelector('.rkui-strip-gap')?.toggleAttribute('data-rkui-shown', gapAfterFirst)
  items[last].querySelector('.rkui-strip-gap')?.toggleAttribute('data-rkui-shown', gapBeforeLast)
}

/** Shows as many of a collapsing strip's tabs as fit, by the rule above. */
const collapse = (strip) => {
  const items = [...strip.querySelectorAll(':scope > .rkui-strip-item')]
  const chosen = items.findIndex((item) => item.querySelector(CHOSEN))
  if (chosen === -1) return
  const last = items.length - 1

  /** The first and last items and those from `low` to `high`, with no gap of a single tab. */
  const run = (low, high) => {
    const from = Math.max(low, 0) === 2 ? 1 : Math.max(low, 0)
    const to = Math.min(high, last) === last - 2 ? last - 1 : Math.min(high, last)
    const shown = new Set([0, last])
    for (let index = from; index <= to; index++) shown.add(index)
    return { low: from, high: to, shown }
  }
  /** Shows the run, and whether it fits. */
  const fits = ({ shown }) => {
    showOnly(items, shown)
    return overflowOf(strip) <= 0
  }
  /** Shows the fewest tabs, then more each side, the one after the chosen tab first. */
  const fill = () => {
    let best = run(chosen - 1, chosen + 1)
    if (!fits(best)) return false
    const open = { after: true, before: true }
    while (open.after || open.before) {
      for (const side of ['after', 'before']) {
        const wider = side === 'after' ? run(best.low, best.high + 1) : run(best.low - 1, best.high)
        const grows = wider.shown.size > best.shown.size
        if (open[side] && grows && fits(wider)) best = wider
        else open[side] = false
      }
    }
    fits(best)
    return true
  }

  for (const small of [false, true]) {
    strip.toggleAttribute('data-rkui-small', small)
    if (fill()) return
  }
  // The chosen tab alone between the step tabs, or between its neighbours. A Folder's neighbours
  // stay in place, tucked, so the arrow keys still reach their radios.
  const neighbours = [chosen - 1, chosen + 1].filter((index) => index >= 0 && index <= last)
  const radios = Boolean(strip.querySelector('input[type="radio"]'))
  if (!hasSteps(strip)) showOnly(items, new Set([chosen, ...neighbours]))
  else showOnly(items, new Set([chosen]), new Set(radios ? neighbours : []))
}

/** Scrolls the strip, and nothing else, so that its chosen tab is in view. */
const showChosen = (strip) => {
  const chosen = strip.querySelector(`:scope > * :is(${CHOSEN})`)
  const tab = chosen?.closest('.rkui-folder-tab, .rkui-tile') ?? chosen
  if (!tab) return
  const down = runsDown(strip)
  const [start, end] = down ? ['top', 'bottom'] : ['left', 'right']
  // The part that scrolls, inside the dots' gutters.
  const outer = strip.getBoundingClientRect()
  const viewStart = outer[start] + (down ? strip.clientTop : strip.clientLeft)
  const viewEnd = viewStart + (down ? strip.clientHeight : strip.clientWidth)
  const box = tab.getBoundingClientRect()
  const by = Math.min(0, box[start] - viewStart) || Math.max(0, box[end] - viewEnd)
  if (by) strip[down ? 'scrollTop' : 'scrollLeft'] += by
}

/**
 * Collapses the strip if it collapses, shows its bar while its tabs still don't fit, and keeps
 * its chosen tab in view.
 */
const fit = (strip) => {
  if (collapses(strip)) collapse(strip)
  const overflow = overflowOf(strip)
  if (overflow > 0) showChosen(strip)
  const bar = partners.get(strip)
  if (!bar) return
  bar.hidden = overflow <= 0
  bar.firstElementChild.style.inlineSize = `calc(100% + ${overflow}px)`
}

/** Every strip set up, to fit again when a web font arrives. */
const strips = new Set()
/** The strips to fit in the next frame, each once. */
const pending = new Set()
let frame = 0

/** Fits the strip in the next frame, with any others that changed. */
const fitSoon = (strip) => {
  pending.add(strip)
  frame ||= requestAnimationFrame(() => {
    frame = 0
    for (const strip of pending) if (strip.isConnected) fit(strip)
    pending.clear()
  })
}

const resized = new ResizeObserver((entries) => {
  for (const { target } of entries) fitSoon(target)
})

// A Pagination in a Vue app moves aria-current to another page without a reload.
const moved = new MutationObserver((records) => {
  for (const { target } of records) fitSoon(target.closest(STRIPS))
})

eachElement(STRIPS, 'data-rkui-strip', (strip) => {
  const bar = strip.parentElement.querySelector(':scope > .rkui-folder-scrollbar')
  if (bar) partners.set(strip, bar).set(bar, strip)
  strips.add(strip)
  resized.observe(strip)
  moved.observe(strip, { attributeFilter: ['aria-current'], subtree: true })
})

// A web font arriving widens the tabs without resizing the strip.
document.fonts?.addEventListener('loadingdone', () => {
  for (const strip of strips) {
    if (strip.isConnected) fitSoon(strip)
    else {
      resized.unobserve(strip)
      strips.delete(strip)
    }
  }
})

// Choosing another tab (Folder.vue says so too when its v-model changes), or a form reset
// putting the radios back, moves what shows.
document.addEventListener('change', ({ target }) => {
  const strip = target.closest?.(STRIPS)
  if (strip) fit(strip)
})
document.addEventListener('reset', ({ target }) => {
  // The reset event comes before the reset itself.
  setTimeout(() => target.querySelectorAll?.(STRIPS).forEach(fit))
})

// Moving one scroller moves its partner, and the scroll event that move causes is ignored, so a
// scroll still in progress there (a fling) isn't pulled back.
document.addEventListener(
  'scroll',
  ({ target }) => {
    const partner = partners.get(target)
    if (!partner) return
    const expected = movedTo.get(target)
    if (
      expected &&
      Math.abs(target.scrollLeft - expected.left) < 1 &&
      Math.abs(target.scrollTop - expected.top) < 1
    ) {
      return
    }
    movedTo.set(partner, { left: target.scrollLeft, top: target.scrollTop })
    partner.scrollLeft = target.scrollLeft
    partner.scrollTop = target.scrollTop
  },
  { capture: true, passive: true },
)
