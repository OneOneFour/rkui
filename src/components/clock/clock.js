import {
  DEGREES_PER_HOUR,
  DEGREES_PER_MINUTE,
  NOON_ANGLE,
  clockFace,
  clockHandAngles,
  twoDigits,
} from '../../shared/clock-face.js'
import { wrap } from '../../shared/dial-geometry.js'

/** @typedef {{ hand: HTMLElement, tag: HTMLElement }} ClockHand */

/**
 * `<rkui-clock>`: a clock face with hands to drag, over a native `<input type="time">`, which stays
 * the control for keys, screen readers and forms. Put a `<label>` and the input inside it, and,
 * optionally, a day and a night icon with the classes `rkui-clock-day-icon` and
 * `rkui-clock-night-icon`. The hour hand goes round once a day on a ring split into day (6:00 to
 * 18:00, over the top) and night. Dragging a hand sets the input, snapping minutes to its `step`
 * (in seconds, e.g. 300 for five minutes), and fires `input` and, on release, `change`. The
 * minute hand carries into the hour as it passes 12. The face is a `<div class="rkui-clock-face">`
 * before the input: the element adopts one already in the markup (the Astro component draws it at
 * build time) and draws it itself, with the same `clockFace`, when there is none.
 */
export class RkuiClock extends HTMLElement {
  // Internal state, set up by the lifecycle callbacks below. Not for pages to use.
  /** Unhooks all of this element's event listeners at once. @type {AbortController | undefined} */
  listeners
  /** The native time input the clock sits over. @type {HTMLInputElement} */
  timeInput
  /** The clock face, before the input. @type {HTMLElement} */
  face
  /** The two hands, each with its tag at the tip. @type {{ hour: ClockHand, minute: ClockHand }} */
  hands
  /** The hand being dragged, if any. @type {'hour' | 'minute' | undefined} */
  grabbed
  /** Where the hour hand points, in degrees; it may pass 360 so the hand turns the short way. */
  hourAngle = 0
  /** Where the minute hand points, in degrees; it may pass 360 so the hand turns the short way. */
  minuteAngle = 0
  /** The input's value when the drag began, to tell on release whether it changed. */
  valueAtDragStart = ''

  connectedCallback() {
    const input = this.querySelector('input[type="time"]')
    if (!(input instanceof HTMLInputElement)) return
    this.timeInput = input
    this.face ??= this.querySelector(':scope > .rkui-clock-face') ?? this.drawFace(input)
    this.hands = {
      hour: this.findHand('hour'),
      minute: this.findHand('minute'),
    }

    this.listeners = new AbortController()
    const { signal } = this.listeners
    this.addEventListener('input', this.render, { signal })
    this.face.addEventListener('pointerdown', this.handlePointerDown, { signal })
    this.face.addEventListener('pointermove', this.handlePointerMove, { signal })
    this.face.addEventListener('lostpointercapture', this.handleDragEnd, { signal })
    this.render()
  }

  disconnectedCallback() {
    this.listeners?.abort()
  }

  // Internal: not for pages to use.

  /**
   * Draws the face (an SVG, the icons, the hands and their tags) and puts it before the input.
   * @param {HTMLInputElement} input
   * @returns {HTMLElement}
   */
  drawFace(input) {
    const { hours, minutes } = this.time()
    const { style, svg, hands } = clockFace(hours, minutes)
    const face = document.createElement('div')
    face.className = 'rkui-clock-face'
    face.setAttribute('aria-hidden', 'true')
    face.style.cssText = style
    face.innerHTML = svg + hands

    const icons = this.querySelectorAll(
      ':scope > :is(.rkui-clock-day-icon, .rkui-clock-night-icon)',
    )
    face.querySelector('svg')?.after(...icons)

    input.before(face)
    return face
  }

  /**
   * @param {'hour' | 'minute'} name
   * @returns {ClockHand} the face's hand of that name, with its tag
   */
  findHand(name) {
    const hand = /** @type {HTMLElement} */ (this.face.querySelector(`.rkui-clock-hand--${name}`))
    const tag = /** @type {HTMLElement} */ (hand.querySelector('.rkui-clock-tag'))
    return { hand, tag }
  }

  /** @returns {{ hours: number, minutes: number }} the input's time; an empty input is midnight */
  time() {
    const [hours = 0, minutes = 0] = this.timeInput.value.split(':').map(Number)
    return { hours, minutes }
  }

  /** @returns {number} the minutes a drag snaps to, from the input's step (one by default) */
  minuteStep() {
    return Math.max(1, Math.round(Number(this.timeInput.step || 60) / 60))
  }

  // An arrow function, so "this" stays the element when it runs as an input handler.
  /** Turns the hands to the input's time and writes it on their tags. */
  render = () => {
    if (this.timeInput.value === '') return
    const { hours, minutes } = this.time()
    const { hour, minute } = this.hands

    const angles = clockHandAngles(hours, minutes, {
      hour: this.hourAngle,
      minute: this.minuteAngle,
    })
    this.hourAngle = angles.hour
    this.minuteAngle = angles.minute
    hour.hand.style.setProperty('--rkui-hand-angle', `${angles.hour}deg`)
    minute.hand.style.setProperty('--rkui-hand-angle', `${angles.minute}deg`)

    hour.tag.textContent = twoDigits(hours)
    minute.tag.textContent = twoDigits(minutes)
  }

  /**
   * Sets the input to the time and fires `input` if it changed.
   * @param {number} hours any whole number; it wraps round the day
   * @param {number} minutes from 0 to 59
   */
  setTime(hours, minutes) {
    const input = this.timeInput
    const value = `${twoDigits(wrap(hours, 24))}:${twoDigits(minutes)}`
    if (value === input.value) return
    input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  /**
   * @param {PointerEvent} event
   * @returns {number} the pointer's angle around the face's centre, clockwise from 12, 0 to 360
   */
  pointerAngle(event) {
    const box = this.face.getBoundingClientRect()
    const dx = event.clientX - (box.left + box.width / 2)
    const dy = event.clientY - (box.top + box.height / 2)
    return wrap((Math.atan2(dx, -dy) * 180) / Math.PI, 360)
  }

  /**
   * @param {PointerEvent} event
   * @returns {'hour' | 'minute'} the hand whose tag is nearer the pointer
   */
  nearestHand(event) {
    const distance = (/** @type {HTMLElement} */ tag) => {
      const box = tag.getBoundingClientRect()
      return Math.hypot(
        event.clientX - (box.left + box.width / 2),
        event.clientY - (box.top + box.height / 2),
      )
    }
    const { hour, minute } = this.hands
    return distance(hour.tag) < distance(minute.tag) ? 'hour' : 'minute'
  }

  /**
   * Moves the grabbed hand to the pointer. The hour hand keeps the minutes; the minute hand snaps
   * to the step and, passing 12, moves the hour on or back, as on a real clock.
   * @param {PointerEvent} event
   */
  setTimeFromPointer(event) {
    const angle = this.pointerAngle(event)
    const { hours, minutes } = this.time()

    if (this.grabbed === 'hour') {
      const hour = Math.round((angle + NOON_ANGLE) / DEGREES_PER_HOUR - minutes / 60)
      this.setTime(hour, minutes)
      return
    }

    const step = this.minuteStep()
    const minute = wrap(Math.round(angle / DEGREES_PER_MINUTE / step) * step, 60)
    let hour = hours
    if (minutes >= 45 && minute < 15) hour += 1
    if (minutes < 15 && minute >= 45) hour -= 1
    this.setTime(hour, minute)
  }

  /** @param {PointerEvent} event */
  handlePointerDown = (event) => {
    if (this.timeInput.disabled || event.button !== 0) return
    this.face.setPointerCapture(event.pointerId)
    this.valueAtDragStart = this.timeInput.value
    this.grabbed = this.nearestHand(event)
    this.hands[this.grabbed].hand.toggleAttribute('data-grabbed', true)
    this.setTimeFromPointer(event)
  }

  /** @param {PointerEvent} event */
  handlePointerMove = (event) => {
    if (this.grabbed) this.setTimeFromPointer(event)
  }

  /** Fires `change` once at the end of a drag, as a native input does when it's committed. */
  handleDragEnd = () => {
    if (!this.grabbed) return
    this.hands[this.grabbed].hand.removeAttribute('data-grabbed')
    this.grabbed = undefined
    const input = this.timeInput
    if (input.value !== this.valueAtDragStart) {
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }
}

customElements.define('rkui-clock', RkuiClock)
