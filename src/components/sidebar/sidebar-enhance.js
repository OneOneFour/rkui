/* Safari and Firefox don't have scroll-initial-target, which opens a sidebar scrolled so that its
   current page shows (sidebar.css). Where it is missing, this scrolls each sidebar the same way,
   the first time it is shown, including a sidebar added after the page loads. */
import { eachElement } from '../../shared/each-element.js'

if (!CSS.supports('scroll-initial-target: nearest')) {
  /** Scrolls the sidebar so that its current page sits at the top, below its scroll padding. */
  const showCurrent = (scroller) => {
    const current = scroller.querySelector('.rkui-sidebar-link[aria-current="page"]')
    if (!current) return
    const padding = parseFloat(getComputedStyle(scroller).scrollPaddingTop) || 0
    const distance = current.getBoundingClientRect().top - scroller.getBoundingClientRect().top
    scroller.scrollTop += Math.round(distance - scroller.clientTop - padding)
  }

  const firstShown = new ResizeObserver((entries) => {
    for (const { target, contentRect } of entries) {
      if (contentRect.height === 0) continue
      firstShown.unobserve(target)
      showCurrent(target)
    }
  })
  eachElement('.rkui-sidebar-scroll', 'data-rkui-sidebar-watched', (scroller) =>
    firstShown.observe(scroller),
  )
}
