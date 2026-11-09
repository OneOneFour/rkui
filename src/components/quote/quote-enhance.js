// Marks a quote whose text is under three lines long, at the normal size, with data-rkui-short:
// "one" for a single line, which quote.css sets two steps larger, "two" for the rest, a step
// larger. It is measured at the normal size every time, so the larger size never feeds back into
// the count. It is checked again when the quote's size changes (one shared ResizeObserver) or its
// text changes (one shared MutationObserver), including in a Vue app. Without this script every
// quote keeps the normal size.
import { eachElement } from '../../shared/each-element.js'

const SHORT = 'data-rkui-short'

/** Quotes whose size changed, checked together in the next frame. */
const pending = new Set()

/** The element's line height in pixels: about 1.2 times its font size where it is `normal`. */
function lineHeight(element) {
  const style = getComputedStyle(element)
  return parseFloat(style.lineHeight) || 1.2 * parseFloat(style.fontSize)
}

/**
 * Sets or clears the quote's mark. The quote is measured with the mark off, and the mark is set
 * again before the page paints, so it never shows the wrong size. A quote that isn't shown (in a
 * closed tab) is left as it is until it is.
 * @param {HTMLElement} quote
 */
function check(quote) {
  if (quote.getClientRects().length === 0) return
  quote.removeAttribute(SHORT)
  const text = quote.matches('figure') ? quote.querySelector(':scope > blockquote') : quote
  const range = document.createRange()
  range.selectNodeContents(text)
  const lines = range.getBoundingClientRect().height / lineHeight(text)
  // Under three lines' height: two lines with a paragraph gap between them still count.
  if (lines < 1.5) quote.setAttribute(SHORT, 'one')
  else if (lines < 2.75) quote.setAttribute(SHORT, 'two')
}

// A size change is checked in the next frame, not in the observer's callback, where changing the
// quote's height would make the browser report a ResizeObserver loop. A check that changes the
// size leads to one more check, which finds the same answer, so it settles.
const resizes = new ResizeObserver((entries) => {
  if (pending.size === 0) {
    requestAnimationFrame(() => {
      for (const quote of pending) check(quote)
      pending.clear()
    })
  }
  for (const { target } of entries) pending.add(target)
})

// A text change is checked at once, before the page paints.
const edits = new MutationObserver((records) => {
  const changed = new Set()
  for (const { target } of records) {
    const element = target instanceof Element ? target : target.parentElement
    // The quote the text is in, and any quote around that one
    let quote = element?.closest('.rkui-quote')
    while (quote) {
      changed.add(quote)
      quote = quote.parentElement?.closest('.rkui-quote')
    }
  }
  for (const quote of changed) check(quote)
})

eachElement('.rkui-quote', 'data-rkui-quote-watched', (quote) => {
  check(quote)
  resizes.observe(quote)
  edits.observe(quote, { childList: true, characterData: true, subtree: true })
})
