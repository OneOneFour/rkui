/* Browsers without scroll-driven animations (Safari before 26, Firefox before 159) can't run the
   animation that shows a scroll region's "more" dots (overflow.css). Where it is missing, this
   sets the same two properties from the scroll position whenever a region scrolls, changes size
   or changes content, including regions added to the page later. */
import { eachElement } from '../../shared/each-element.js'

if (!CSS.supports('animation-timeline: scroll()')) {
  const REGIONS = '.rkui-scroll:not(.rkui-scroll--bar)'
  // The keyframes' 5%: how much of the scroll each side's dots take to fade.
  const FADE = 0.05

  /** Sets the region's dots as the animation's keyframes would for its scroll position. */
  const showMore = (region) => {
    const range = region.scrollWidth - region.clientWidth
    if (range <= 0) {
      region.style.setProperty('--rkui-scroll-more-start', 0)
      region.style.setProperty('--rkui-scroll-more-end', 0)
      return
    }
    const progress = Math.min(1, Math.abs(region.scrollLeft) / range)
    region.style.setProperty('--rkui-scroll-more-start', Math.min(1, progress / FADE))
    region.style.setProperty('--rkui-scroll-more-end', Math.min(1, (1 - progress) / FADE))
  }

  const resized = new ResizeObserver((entries) => {
    for (const entry of entries) showMore(entry.target)
  })
  eachElement(REGIONS, 'data-rkui-scroll-watched', (region) => resized.observe(region))

  // Content that changes inside a region can change how far it scrolls without changing its size.
  new MutationObserver((records) => {
    for (const { target } of records) {
      const region = (target instanceof Element ? target : target.parentElement)?.closest(REGIONS)
      if (region) showMore(region)
    }
  }).observe(document.documentElement, { childList: true, characterData: true, subtree: true })

  document.addEventListener(
    'scroll',
    (event) => {
      if (event.target.matches?.(REGIONS)) showMore(event.target)
    },
    { capture: true, passive: true },
  )
}
