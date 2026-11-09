// Escape hides an open tooltip, so it can be dismissed without moving the pointer or focus (WCAG
// 1.4.13). It stays hidden until the pointer and focus that held it open have left it, and shows
// again when one comes back. Without this script the tooltip still works; Escape does nothing.
// It needs no eachElement(): it looks for open tooltips only when Escape is pressed.
const MARK = 'data-rkui-dismissed'

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return
  const open = document.querySelectorAll(
    `.rkui-tooltip:is(:hover, :has(:focus-visible)):not([${MARK}])`,
  )
  if (open.length === 0) return
  for (const tooltip of open) dismiss(/** @type {HTMLElement} */ (tooltip))
  // That Escape was for the tooltip, the topmost thing open: a Popup or dialog under it closes on
  // the next one.
  event.preventDefault()
})

/**
 * Hides an open tooltip until neither the pointer nor focus holds it open. Its two listeners last
 * only that long.
 * @param {HTMLElement} tooltip
 */
function dismiss(tooltip) {
  tooltip.setAttribute(MARK, '')
  const listening = new AbortController()
  /**
   * @param {PointerEvent | FocusEvent} event the pointer or focus leaving an element
   * @param {string} stillOpen what else may still hold the tooltip open
   */
  const leave = (event, stillOpen) => {
    if (tooltip.contains(/** @type {Node | null} */ (event.relatedTarget))) return
    if (tooltip.matches(stillOpen)) return
    tooltip.removeAttribute(MARK)
    listening.abort()
  }
  const { signal } = listening
  tooltip.addEventListener('pointerout', (event) => leave(event, ':has(:focus-visible)'), {
    signal,
  })
  tooltip.addEventListener('focusout', (event) => leave(event, ':hover'), { signal })
}
