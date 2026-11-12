// Counts an animated stat's numbers (.rkui-stat--animate) up from zero the first time its value
// is in view (stat.css), then lands it with a small pop. Every number in the value counts
// together, keeping its decimals and thousands commas; the words, units and signs around them
// stay. The stat's own text never changes: a copy of it counts on top, hidden from screen readers,
// with each number holding its final width, so nothing moves and the final value is always what
// is read. stat.css times the count.
// A stat out of view waits with its number hidden; once it has landed it is "done". One already
// in view when the script finds it counts too if the page carries table-init.js's mark, which
// kept it hidden; without the mark it may have shown its final value already, so it keeps it. A
// stat with no number, and every stat under reduced motion, just show their final value. It comes
// in rkui.js.
import { eachElement } from '../../shared/each-element.js'

/** A number in a value: digits, optional thousands commas, optional decimals. */
const NUMBER = /\d+(?:,\d{3})*(?:\.\d+)?/g

/**
 * A number `progress` (0 to 1) of the way from zero to its final value, written the same way:
 * the same decimals, and thousands commas if it has them.
 * @param {string} final
 * @param {number} progress
 */
function partway(final, progress) {
  const decimals = final.includes('.') ? final.length - final.indexOf('.') - 1 : 0
  return (Number(final.replaceAll(',', '')) * progress).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: final.includes(','),
  })
}

/**
 * The counter for a value's text: its words as they are, and each number written out unseen, so it
 * holds its final width, followed by the counting number, set back against it. Returns the counter
 * and each counting text node with its final number.
 * @param {string} text
 */
function makeCounter(text) {
  const counter = document.createElement('span')
  counter.className = 'rkui-stat-counter'
  counter.setAttribute('aria-hidden', 'true')
  /** @type {{ shown: Text, final: string }[]} */
  const numbers = []
  let end = 0
  for (const { 0: final, index } of text.matchAll(NUMBER)) {
    const unseen = document.createElement('span')
    unseen.className = 'rkui-stat-counter-final'
    unseen.append(final)
    const shown = new Text(partway(final, 0))
    const counting = document.createElement('span')
    counting.className = 'rkui-stat-counter-now'
    counting.append(shown)
    counter.append(text.slice(end, index), unseen, counting)
    numbers.push({ shown, final })
    end = index + final.length
  }
  counter.append(text.slice(end))
  return { counter, numbers }
}

/**
 * Counts one waiting stat up, then lands it.
 * @param {HTMLElement} stat
 */
function count(stat) {
  const number = /** @type {HTMLElement} */ (stat.querySelector('.rkui-stat-number'))
  const { counter, numbers } = makeCounter(/** @type {Text} */ (number.firstChild).data)
  number.append(counter)
  stat.dataset.rkuiCountState = 'counting'

  const frame = () => {
    if (stat.dataset.rkuiCountState !== 'counting' || !stat.isConnected) return
    // A Vue island waking up over the stat removes the counter it didn't draw; put it back.
    if (!counter.isConnected) number.append(counter)
    const progress = Number(getComputedStyle(stat).getPropertyValue('--rkui-stat-progress'))
    for (const { shown, final } of numbers) shown.data = partway(final, progress)
    requestAnimationFrame(frame)
  }
  frame()

  /** @param {AnimationEvent} event */
  const land = (event) => {
    if (event.target !== stat || event.animationName !== 'rkui-stat-count') return
    stat.removeEventListener('animationend', land)
    stat.removeEventListener('animationcancel', land)
    counter.remove()
    stat.dataset.rkuiCountState = 'landed'
  }
  stat.addEventListener('animationend', land)
  stat.addEventListener('animationcancel', land)

  // Once the pop has played, the stat is done, so showing it again (a tab switched back) doesn't
  // pop it again.
  /** @param {AnimationEvent} event */
  const done = (event) => {
    if (event.animationName !== 'rkui-stat-pop') return
    stat.removeEventListener('animationend', done)
    stat.removeEventListener('animationcancel', done)
    stat.dataset.rkuiCountState = 'done'
  }
  stat.addEventListener('animationend', done)
  stat.addEventListener('animationcancel', done)
}

if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  /** @param {IntersectionObserverEntry[]} entries @param {IntersectionObserver} observer */
  const start = (entries, observer) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue
      observer.unobserve(target)
      count(/** @type {HTMLElement} */ (target.closest('.rkui-stat')))
    }
  }
  // A stat counts once its value is a quarter of the window's height above the bottom edge, so it
  // isn't counting mostly out of sight. A value that can never get that far up, as it is too near
  // the end of the page, counts as soon as it shows. Its note doesn't count, so a long note doesn't
  // hold it back.
  const higherUp = new IntersectionObserver(start, { rootMargin: '0px 0px -25% 0px' })
  const nearTheEnd = new IntersectionObserver(start)
  eachElement('.rkui-stat--animate', 'data-rkui-stat-watched', (stat) => {
    const value = stat.querySelector('.rkui-stat-value')
    const text = value?.querySelector(':scope > .rkui-stat-number')?.firstChild
    if (!value || text?.nodeType !== Node.TEXT_NODE || !/\d/.test(text.data)) return
    const { top, bottom } = value.getBoundingClientRect()
    const inView = top < innerHeight && bottom > 0
    if (inView && !('rkuiTables' in document.documentElement.dataset)) return
    stat.dataset.rkuiCountState = 'waiting'
    const belowIt = document.documentElement.scrollHeight - (scrollY + bottom)
    ;(belowIt < innerHeight / 4 ? nearTheEnd : higherUp).observe(value)
  })
}
