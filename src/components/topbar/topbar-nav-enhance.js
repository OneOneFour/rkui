/* A top bar's page links are one line that scrolls sideways when they don't fit (topbar.css). This
   scrolls that line so the current page's link sits in the middle, whenever it would otherwise be
   out of view: when the line first shows, and again when its size changes (a control beside it
   starting up, the window turning), including a nav added after the page loads. Only the line
   scrolls, never the page. Where every link fits, it does nothing. */
import { eachElement } from '../../shared/each-element.js'

/** Scrolls the line so its current link is in the middle, if it is out of view. */
const showCurrent = (line) => {
  const current = line.querySelector('[aria-current="page"]')
  if (!current) return
  // The room the links can use: inside the borders, and clear of the scroll padding (the pill).
  const style = getComputedStyle(line)
  const box = line.getBoundingClientRect()
  const start =
    box.left + parseFloat(style.borderLeftWidth) + (parseFloat(style.scrollPaddingInlineStart) || 0)
  const end =
    box.right - parseFloat(style.borderRightWidth) - (parseFloat(style.scrollPaddingInlineEnd) || 0)
  const link = current.getBoundingClientRect()
  if (link.left >= start && link.right <= end) return
  line.scrollLeft += link.left + link.width / 2 - (start + end) / 2
}

const resized = new ResizeObserver((entries) => {
  for (const { target } of entries) showCurrent(target)
})
eachElement('.rkui-topbar-nav > .rkui-scroll', 'data-rkui-nav-watched', (line) =>
  resized.observe(line),
)
