// Rolls an animated stat's numbers (.rkui-stat--animate; stat.css). The first time its value is in
// view it counts up from zero over --rkui-stat-count-duration and lands with a small pop. After
// that, whenever its value changes (a Vue prop, a page script), it rolls from the numbers on screen
// to the new ones over --rkui-stat-change-duration and stops, with no pop; a change in the middle
// of a roll carries on from where it is. Numbers are matched by position, keeping the decimals and
// thousands commas the new value writes; a value with a different count of numbers just shows.
// The stat's own text is never touched, so screen readers have the new value at once: a copy of it
// rolls on top, hidden from them, with each number holding its final width, so nothing moves.
// A stat out of view waits with its number hidden, and counts to whatever its value is when it
// comes into view. One already in view when the script finds it counts too if the page carries
// table-init.js's mark, which kept it hidden; without the mark it may have shown its final value
// already, so it keeps it. Under reduced motion it does nothing, and every value just shows. It
// comes in rkui.js.
import { eachElement } from '../../shared/each-element.js'

/** A number in a value: digits, optional thousands commas, optional decimals. */
const NUMBER = /\d+(?:,\d{3})*(?:\.\d+)?/g

/** One frame at 60 frames a second, in milliseconds. */
const FRAME = 1000 / 60

/** The numbers written in a text, e.g. '3 to 9 in' → ['3', '9']. */
const numbersIn = (/** @type {string} */ text) => text.match(NUMBER) ?? []

/** A written number's value, e.g. '1,204' → 1204. */
const valueOf = (/** @type {string} */ written) => Number(written.replaceAll(',', ''))

/** The text a stat's number holds: its value, without the trend arrow. */
function textOf(/** @type {Element} */ number) {
  const text = number.firstChild
  return text?.nodeType === Node.TEXT_NODE ? /** @type {Text} */ (text).data : ''
}

/**
 * A number `progress` (0 to 1) of the way from `from` to `final`, written the way `final` is: the
 * same decimals, and thousands commas if it has them.
 * @param {number} from
 * @param {string} final
 * @param {number} progress
 */
function between(from, final, progress) {
  const decimals = final.includes('.') ? final.length - final.indexOf('.') - 1 : 0
  return (from + (valueOf(final) - from) * progress).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: final.includes(','),
  })
}

/**
 * The counter for a value's text: its words as they are, and each number written out unseen, so
 * it holds its final width, followed by the rolling number, set back against it. Returns the
 * counter and each rolling text node with where it starts and ends.
 * @param {string} text
 * @param {number[]} starts where each number starts, in order
 */
function makeCounter(text, starts) {
  const counter = document.createElement('span')
  counter.className = 'rkui-stat-counter'
  counter.setAttribute('aria-hidden', 'true')
  /** @type {{ shown: Text, from: number, final: string }[]} */
  const numbers = []
  let end = 0
  for (const { 0: final, index } of text.matchAll(NUMBER)) {
    const from = starts[numbers.length]
    const unseen = document.createElement('span')
    unseen.className = 'rkui-stat-counter-final'
    unseen.append(final)
    const shown = new Text(between(from, final, 0))
    const rolling = document.createElement('span')
    rolling.className = 'rkui-stat-counter-now'
    rolling.append(shown)
    counter.append(text.slice(end, index), unseen, rolling)
    numbers.push({ shown, from, final })
    end = index + final.length
  }
  counter.append(text.slice(end))
  return { counter, numbers }
}

/**
 * A length in milliseconds from one of stat.css's duration properties.
 * @param {Element} stat
 * @param {string} name
 */
function duration(stat, name) {
  const written = getComputedStyle(stat).getPropertyValue(name).trim()
  return parseFloat(written) * (written.endsWith('ms') ? 1 : 1000) || 0
}

/**
 * A roll under way: its counter, each rolling number, and the timer whose eased progress it
 * follows.
 * @typedef {object} Roll
 * @property {HTMLElement} counter
 * @property {{ shown: Text, from: number, final: string }[]} numbers
 * @property {Animation} timer
 */

/** Each stat's roll while it lasts. @type {WeakMap<HTMLElement, Roll>} */
const rolls = new WeakMap()

/** The text each stat last showed, to tell a change from the counter's own writes. */
const shownTexts = new WeakMap()

/**
 * Rolls a stat's numbers from `starts` to the ones in its text: its first count, which pops as it
 * lands, or a change, which just stops. A roll already under way gives way to it.
 * @param {HTMLElement} stat
 * @param {number[]} starts
 * @param {boolean} first
 */
function roll(stat, starts, first) {
  const number = /** @type {HTMLElement} */ (stat.querySelector('.rkui-stat-number'))
  const text = textOf(number)
  stop(stat)
  shownTexts.set(stat, text)
  const { counter, numbers } = makeCounter(text, starts)
  number.append(counter)
  // An animation with no keyframes only keeps time: its eased progress is the roll's.
  const length = duration(
    stat,
    first ? '--rkui-stat-count-duration' : '--rkui-stat-change-duration',
  )
  const timer = stat.animate(null, { duration: length, easing: 'ease-out' })
  // A change starts a frame in, so a stream of them (a dragged slider) keeps the number moving
  // rather than holding it still each time.
  if (!first) timer.currentTime = Math.min(FRAME, length)
  const record = { counter, numbers, timer }
  rolls.set(stat, record)
  stat.dataset.rkuiCountState = 'rolling'

  const frame = () => {
    if (rolls.get(stat) !== record || !stat.isConnected) return
    // A Vue island waking up over the stat removes the counter it didn't draw; put it back.
    if (!counter.isConnected) number.append(counter)
    const progress = timer.effect?.getComputedTiming().progress ?? 1
    for (const { shown, from, final } of numbers) shown.data = between(from, final, progress)
    requestAnimationFrame(frame)
  }
  frame()
  timer.finished.then(
    () => {
      if (rolls.get(stat) !== record) return
      stop(stat)
      stat.dataset.rkuiCountState = first ? 'landed' : 'done'
    },
    () => {},
  )
}

/**
 * Once a stat's pop has played (stat.css), the stat is done, so showing it again (a tab switched
 * back) doesn't pop it again.
 * @param {AnimationEvent} event
 */
function popped(event) {
  const stat = /** @type {Element} */ (event.target).closest('.rkui-stat')
  if (event.animationName !== 'rkui-stat-pop' || !(stat instanceof HTMLElement)) return
  if (stat.dataset.rkuiCountState === 'landed') stat.dataset.rkuiCountState = 'done'
}

/**
 * Counts a waiting stat up from zero, or just shows its value if it has no numbers by now.
 * @param {HTMLElement} stat
 */
function countUp(stat) {
  const finals = numbersIn(textOf(/** @type {Element} */ (stat.querySelector('.rkui-stat-number'))))
  if (finals.length > 0)
    roll(
      stat,
      finals.map(() => 0),
      true,
    )
  else delete stat.dataset.rkuiCountState
}

/** Ends a stat's roll, if it has one, and takes its counter away. */
function stop(/** @type {HTMLElement} */ stat) {
  const record = rolls.get(stat)
  if (!record) return
  rolls.delete(stat)
  record.timer.cancel()
  record.counter.remove()
}

/**
 * Answers a change in a stat's value: rolls from the numbers on screen to the new ones, or just
 * shows the new value when it has a different count of numbers. A stat still waiting to count
 * up counts to its value when it comes into view, so it needs nothing.
 * @param {HTMLElement} stat
 */
function changed(stat) {
  const text = textOf(/** @type {Element} */ (stat.querySelector('.rkui-stat-number')))
  const before = shownTexts.get(stat)
  if (text === before || stat.dataset.rkuiCountState === 'waiting' || !stat.isConnected) return
  const record = rolls.get(stat)
  const starts = record
    ? record.numbers.map(({ shown }) => valueOf(shown.data))
    : numbersIn(before ?? '').map(valueOf)
  if (starts.length === 0 || starts.length !== numbersIn(text).length) {
    stop(stat)
    shownTexts.set(stat, text)
    stat.dataset.rkuiCountState = 'done'
    return
  }
  roll(stat, starts, false)
}

if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  /** @param {IntersectionObserverEntry[]} entries @param {IntersectionObserver} observer */
  const start = (entries, observer) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue
      observer.unobserve(target)
      const stat = /** @type {HTMLElement} */ (target.closest('.rkui-stat'))
      // In an Astro island that hasn't woken up yet, Vue would throw the counter away as a
      // mismatch, so the count waits for it.
      const island = stat.closest('astro-island[ssr]')
      if (island) island.addEventListener('astro:hydrate', () => countUp(stat), { once: true })
      else countUp(stat)
    }
  }
  // A stat counts once its value is a quarter of the window's height above the bottom edge, so it
  // isn't counting mostly out of sight. A value that can never get that far up, as it is too near
  // the end of the page, counts as soon as it shows. Its note doesn't count, so a long note doesn't
  // hold it back.
  const higherUp = new IntersectionObserver(start, { rootMargin: '0px 0px -25% 0px' })
  const nearTheEnd = new IntersectionObserver(start)

  document.addEventListener('animationend', popped)
  document.addEventListener('animationcancel', popped)

  // One observer hears every animated stat's value change. The counter's own writes, inside it,
  // are skipped; anything else that leaves the text as it was is ignored by changed().
  const changes = new MutationObserver((records) => {
    const stats = new Set()
    for (const { target } of records) {
      const element = target instanceof Element ? target : target.parentElement
      if (!element || element.closest('.rkui-stat-counter')) continue
      const stat = element.closest('.rkui-stat')
      if (stat) stats.add(stat)
    }
    for (const stat of stats) changed(/** @type {HTMLElement} */ (stat))
  })

  eachElement('.rkui-stat--animate', 'data-rkui-stat-watched', (stat) => {
    const value = stat.querySelector('.rkui-stat-value')
    const number = value?.querySelector(':scope > .rkui-stat-number')
    if (!value || !number) return
    changes.observe(number, { characterData: true, childList: true, subtree: true })
    shownTexts.set(stat, textOf(number))
    if (numbersIn(textOf(number)).length === 0) return
    const { top, bottom } = value.getBoundingClientRect()
    const inView = top < innerHeight && bottom > 0
    if (inView && !('rkuiTables' in document.documentElement.dataset)) return
    stat.dataset.rkuiCountState = 'waiting'
    const belowIt = document.documentElement.scrollHeight - (scrollY + bottom)
    ;(belowIt < innerHeight / 4 ? nearTheEnd : higherUp).observe(value)
  })
}
