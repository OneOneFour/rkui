// Finds elements for the enhance scripts, including ones a Vue app or a page script adds after the
// scripts have run. One MutationObserver serves every script.

/** @type {((root: Element) => void)[]} */
const watchers = []
/** @type {MutationObserver | undefined} */
let observer

/**
 * Calls `setUp` once for each element that matches `selector`, now and whenever one is added to
 * the page later. Each element it sets up gets the attribute `mark`, so none is set up twice, even
 * by a second copy of the script.
 * @param {string} selector
 * @param {string} mark an attribute name, e.g. 'data-rkui-bar'
 * @param {(element: HTMLElement) => void} setUp
 */
export function eachElement(selector, mark, setUp) {
  /** @param {Element} root */
  const watch = (root) => {
    const found = [...(root.matches(selector) ? [root] : []), ...root.querySelectorAll(selector)]
    for (const element of found) {
      if (element.hasAttribute(mark)) continue
      element.setAttribute(mark, '')
      setUp(/** @type {HTMLElement} */ (element))
    }
  }
  watch(document.documentElement)
  watchers.push(watch)
  if (observer) return
  observer = new MutationObserver((records) => {
    for (const { addedNodes } of records) {
      for (const node of addedNodes) {
        if (node instanceof Element) for (const each of watchers) each(node)
      }
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
}
