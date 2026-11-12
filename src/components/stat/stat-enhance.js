// Rolls an animated stat's numbers (.rkui-stat--animate; stat.css). The first time its value is in
// view it counts up from zero over --rkui-stat-count-duration and lands with a small pop; a change
// during that count retargets it, keeping its time and its pop. After that, whenever its value
// changes (a Vue prop, a page script), it rolls from the numbers on screen to the new ones over
// --rkui-stat-change-duration and stops, with no pop; a change in the middle of a roll carries on
// from where it is. Numbers are matched by position, keeping the decimals the new value writes,
// with thousands commas while either value has them. A value of another shape (other numbers, or
// other words or signs around them) just shows.
// The stat's own text is never touched, so screen readers have the new value at once: a copy of it
// rolls on top, hidden from them. Each number in the copy holds its room, so nothing moves until
// it lands: the final number's width on the first count, and the wider of the old and new numbers
// on a change, so a narrower number's spare room goes towards the end.
// A stat out of view waits with its number hidden, and counts to whatever its value is when it
// comes into view. One already in view when the script finds it counts too if the page carries
// table-init.js's mark, which kept it hidden; without the mark it may have shown its final value
// already, so it keeps it. Under reduced motion it does nothing, and every value just shows. It
// comes in rkui.js.
import { eachElement } from '../../shared/each-element.js'
import { timeOf } from '../../shared/css-time.js'

/** A number in a value: digits, optional thousands commas, optional decimals. */
const NUMBER = /\d+(?:,\d{3})*(?:\.\d+)?/g

/** One frame at 60 frames a second, in milliseconds. */
const FRAME = 1000 / 60

/** The numbers written in a text, e.g. '3 to 9 in' → ['3', '9']. */
const numbersIn = (/** @type {string} */ text) => text.match(NUMBER) ?? []

/** A text's shape: its words and signs, with each number as '#', e.g. '−3 °C' → '−# °C'. */
const shapeOf = (/** @type {string} */ text) => text.replace(NUMBER, '#')

/** A written number's value, e.g. '1,204' → 1204. */
const valueOf = (/** @type {string} */ written) => Number(written.replaceAll(',', ''))

/** The text a stat's number holds: its value, without the trend arrow. */
function textOf(/** @type {Element} */ number) {
  const text = number.firstChild
  return text?.nodeType === Node.TEXT_NODE ? /** @type {Text} */ (text).data : ''
}

/**
 * One rolling number in a counter.
 * @typedef {object} Rolling
 * @property {Text} shown the text it writes
 * @property {number} start where it starts
 * @property {string} final the number it rolls to, as written
 * @property {boolean} grouped whether it is written with thousands commas
 */

/**
 * A number on its way from `start` to `final`, `share` (0 to 1) of the way there, with the
 * decimals `final` has.
 * @param {Rolling} rolling
 * @param {number} share
 */
function between({ start, final, grouped }, share) {
  const decimals = final.includes('.') ? final.length - final.indexOf('.') - 1 : 0
  return (start + (valueOf(final) - start) * share).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  })
}

/**
 * The counter for a value's text: its words as they are, and each number's room, unseen, followed
 * by the rolling number, set back against the room's end. The room is the final number, or with
 * `holdStarts` the wider of the start and the final.
 * @param {string} text
 * @param {string[]} starts each number's start, as written
 * @param {boolean} holdStarts
 */
function makeCounter(text, starts, holdStarts) {
  const counter = document.createElement('span')
  counter.className = 'rkui-stat-counter'
  counter.setAttribute('aria-hidden', 'true')
  /** @type {Rolling[]} */
  const numbers = []
  let end = 0
  for (const { 0: final, index } of text.matchAll(NUMBER)) {
    const start = starts[numbers.length]
    const room = document.createElement('span')
    if (holdStarts && start !== final) {
      room.className = 'rkui-stat-counter-wider'
      room.append(
        ...[start, final].map((written) =>
          Object.assign(document.createElement('span'), { textContent: written }),
        ),
      )
    } else {
      room.className = 'rkui-stat-counter-final'
      room.append(final)
    }
    const rolling = {
      shown: new Text(),
      start: valueOf(start),
      final,
      grouped: start.includes(',') || final.includes(','),
    }
    rolling.shown.data = between(rolling, 0)
    const now = document.createElement('span')
    now.className = 'rkui-stat-counter-now'
    now.append(rolling.shown)
    counter.append(text.slice(end, index), room, now)
    numbers.push(rolling)
    end = index + final.length
  }
  counter.append(text.slice(end))
  return { counter, numbers }
}

/**
 * A roll under way. A first count lands with the pop; a change just stops.
 * @typedef {object} Roll
 * @property {'first count' | 'change'} kind
 * @property {HTMLElement} counter
 * @property {Rolling[]} numbers
 * @property {Animation} timer an animation with no keyframes, whose eased progress the roll takes
 * @property {number} from the timer's progress when the numbers set off, as a retargeted first
 *   count carries on its own time
 */

/** Each stat's roll while it lasts. @type {WeakMap<HTMLElement, Roll>} */
const rolls = new WeakMap()

/** The text each stat last showed, to tell a change from the counter's own writes. */
const shownTexts = new WeakMap()

/** A timer's eased progress, 0 to 1. */
const progressOf = (/** @type {Animation} */ timer) =>
  timer.effect?.getComputedTiming().progress ?? 1

/**
 * Rolls a stat's numbers to the ones in its text: a first count from zero, or a change from the
 * numbers on screen. A change during the first count retargets it, keeping its time and its pop;
 * any other roll under way gives way to the new one.
 * @param {HTMLElement} stat
 * @param {'first count' | 'change'} asked
 */
function roll(stat, asked) {
  const number = /** @type {HTMLElement} */ (stat.querySelector('.rkui-stat-number'))
  const text = textOf(number)
  const current = rolls.get(stat)
  const starts =
    asked === 'first count'
      ? numbersIn(text).map(() => '0')
      : (current?.numbers.map(({ shown }) => shown.data) ?? numbersIn(shownTexts.get(stat) ?? ''))
  const retarget = asked === 'change' && current?.kind === 'first count'
  current?.counter.remove()
  if (current && !retarget) current.timer.cancel()

  let timer
  if (retarget) {
    timer = current.timer
  } else {
    const property =
      asked === 'first count' ? '--rkui-stat-count-duration' : '--rkui-stat-change-duration'
    const length = timeOf(stat, property)
    timer = stat.animate(null, { duration: length, easing: 'ease-out' })
    // A change starts a frame in, so a stream of them (a dragged slider) keeps the number moving
    // rather than holding it still each time.
    if (asked === 'change') timer.currentTime = Math.min(FRAME, length)
  }
  const { counter, numbers } = makeCounter(text, starts, asked === 'change')
  /** @type {Roll} */
  const record = {
    kind: retarget ? 'first count' : asked,
    counter,
    numbers,
    timer,
    from: retarget ? progressOf(timer) : 0,
  }
  rolls.set(stat, record)
  shownTexts.set(stat, text)
  number.append(counter)
  stat.dataset.rkuiCountState = 'rolling'

  const frame = () => {
    if (rolls.get(stat) !== record || !stat.isConnected) return
    // Vue waking up over the stat removes the counter it didn't draw; put it back.
    if (!counter.isConnected) number.append(counter)
    const share = record.from < 1 ? (progressOf(timer) - record.from) / (1 - record.from) : 1
    for (const rolling of numbers) rolling.shown.data = between(rolling, share)
    requestAnimationFrame(frame)
  }
  frame()
  if (retarget) return
  timer.finished.then(
    () => {
      const landing = rolls.get(stat)
      if (landing?.timer !== timer) return
      stop(stat)
      stat.dataset.rkuiCountState = landing.kind === 'first count' ? 'landed' : 'done'
    },
    () => {},
  )
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
 * Answers a change in a stat's value: rolls to the new numbers, or just shows the new value when
 * its shape differs. A stat still waiting to count up counts to its value when it comes into
 * view, so it needs nothing.
 * @param {HTMLElement} stat
 */
function changed(stat) {
  const text = textOf(/** @type {Element} */ (stat.querySelector('.rkui-stat-number')))
  const before = shownTexts.get(stat) ?? ''
  if (text === before || stat.dataset.rkuiCountState === 'waiting' || !stat.isConnected) return
  if (shapeOf(text) !== shapeOf(before) || numbersIn(text).length === 0) {
    stop(stat)
    shownTexts.set(stat, text)
    stat.dataset.rkuiCountState = 'done'
    return
  }
  roll(stat, 'change')
}

if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  /** @param {IntersectionObserverEntry[]} entries @param {IntersectionObserver} observer */
  const start = (entries, observer) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue
      observer.unobserve(target)
      const stat = /** @type {HTMLElement} */ (target.closest('.rkui-stat'))
      const number = /** @type {Element} */ (stat.querySelector('.rkui-stat-number'))
      if (numbersIn(textOf(number)).length > 0) roll(stat, 'first count')
      else delete stat.dataset.rkuiCountState
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
