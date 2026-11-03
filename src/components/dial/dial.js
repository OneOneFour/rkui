import {
  END_ANGLE,
  TRACK_RADIUS,
  START_ANGLE,
  angleToValue,
  dialFace,
  faceStyle,
  isBlockLit,
  valueToAngle,
} from '../../shared/dial-face.js'
import { arcPath } from '../../shared/dial-geometry.js'

/**
 * @param {number} dx distance right of the centre
 * @param {number} dy distance below the centre
 * @returns {number} the angle of that point, from -180 to 180
 */
function pointToAngle(dx, dy) {
  return (Math.atan2(dx, -dy) * 180) / Math.PI
}

/**
 * `<rkui-dial>`: a rotary "thermostat" over a native range input, which stays the focusable,
 * accessible control (keys, labels and forms work as usual). Put a `<label>`, an
 * `<input type="range">` and an optional `<output>` inside it. Add the class `rkui-dial--knob` for
 * a turning knob or `rkui-dial--arc` for a filled arc with a thumb, and `rkui-dial--ramp` for a
 * ring of coloured blocks that light up to the value (dial.css has the ramps). Dragging around the
 * dial sets the value and fires `input` and, on release, `change`; the wheel steps it while the
 * input has focus. The face is a `<div class="rkui-dial-face">` before the input: the element
 * adopts one already in the markup (the Astro component draws it at build time) and draws it
 * itself, with the same `dialFace`, when there is none.
 */
export class RkuiDial extends HTMLElement {
  // Internal state, set up by the lifecycle callbacks below. Not for pages to use.
  /** Unhooks all of this element's event listeners at once. @type {AbortController | undefined} */
  listeners
  /** The native range input the dial sits over. @type {HTMLInputElement} */
  rangeInput
  /** The dial face, before the input. @type {HTMLElement} */
  face
  /** The filled part of the arc, in the arc style only. @type {Element | null} */
  fillArc = null
  /** The ring blocks that light up to the value, in the ramp style only. @type {Element[]} */
  blocks = []
  /** The input's value when the drag began, to tell on release whether it changed. */
  valueAtDragStart = ''

  connectedCallback() {
    const input = this.querySelector('input[type="range"]')
    if (!(input instanceof HTMLInputElement)) return
    this.rangeInput = input
    this.face ??= this.querySelector(':scope > .rkui-dial-face') ?? this.drawFace(input)
    this.fillArc = this.face.querySelector('.rkui-dial-fill')
    this.blocks = [...this.face.querySelectorAll('.rkui-dial-block')]

    this.listeners = new AbortController()
    const { signal } = this.listeners
    this.addEventListener('input', this.render, { signal })
    this.addEventListener('wheel', this.handleWheel, { signal, passive: false })
    this.face.addEventListener('pointerdown', this.handlePointerDown, { signal })
    this.face.addEventListener('pointermove', this.handlePointerMove, { signal })
    this.face.addEventListener('lostpointercapture', this.handleDragEnd, { signal })
    // A mousedown on the face would otherwise move focus off the input.
    this.face.addEventListener('mousedown', (event) => event.preventDefault(), { signal })
    this.render()
  }

  disconnectedCallback() {
    this.listeners?.abort()
  }

  // Internal: not for pages to use.

  /** @returns {{ min: number, max: number }} the input's limits; a range defaults to 0 and 100 */
  limits() {
    const input = this.rangeInput
    return { min: Number(input.min || 0), max: Number(input.max || 100) }
  }

  /**
   * Draws the face and puts it before the input.
   * @param {HTMLInputElement} input
   * @returns {HTMLElement}
   */
  drawFace(input) {
    const { min, max } = this.limits()
    const { style, html } = dialFace({
      min,
      max,
      value: input.valueAsNumber,
      arc: this.classList.contains('rkui-dial--arc'),
      rampSteps: this.classList.contains('rkui-dial--ramp') ? this.rampStepCount() : 0,
    })
    const face = document.createElement('div')
    face.className = 'rkui-dial-face'
    face.setAttribute('aria-hidden', 'true')
    face.style.cssText = style
    face.innerHTML = html
    input.before(face)
    return face
  }

  /** @returns {number} how many colours the ramp has, from `--rkui-dial-ramp-steps` (at least 1) */
  rampStepCount() {
    const count = parseInt(getComputedStyle(this).getPropertyValue('--rkui-dial-ramp-steps'), 10)
    return count > 0 ? count : 1
  }

  // An arrow function, so "this" stays the element when it runs as an input handler.
  /**
   * Turns the knob, or moves the arc and thumb, to the input's value, lights the ramp's blocks up
   * to it, and updates the output.
   */
  render = () => {
    const input = this.rangeInput
    const { min, max } = this.limits()
    const angle = valueToAngle(input.valueAsNumber, min, max)
    this.face.style.cssText = faceStyle(angle)

    this.fillArc?.setAttribute('d', arcPath(TRACK_RADIUS, START_ANGLE, angle))

    const fraction = (input.valueAsNumber - min) / (max - min)
    this.blocks.forEach((block, index) => {
      block.toggleAttribute('data-lit', isBlockLit(index, fraction))
    })

    const output = this.querySelector('output')
    if (output) output.value = input.value
  }

  /**
   * Sets the input's value and fires `input` if it changed. The browser clamps a range input's
   * value to its min and max and snaps it to the nearest step.
   * @param {number} value
   */
  setValue(value) {
    const input = this.rangeInput
    const before = input.value
    input.value = String(value)
    if (input.value !== before) input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  /**
   * Sets the value from where the pointer is around the dial's centre. In the gap at the bottom,
   * it holds at the nearer end, so a drag past either end doesn't jump to the other.
   * @param {PointerEvent} event
   */
  setValueFromPointer(event) {
    const box = this.face.getBoundingClientRect()
    const angle = pointToAngle(
      event.clientX - (box.left + box.width / 2),
      event.clientY - (box.top + box.height / 2),
    )
    const { min, max } = this.limits()
    if (Math.abs(angle) <= END_ANGLE) {
      this.setValue(angleToValue(angle, min, max))
    } else {
      const current = this.rangeInput.valueAsNumber
      this.setValue(current > (min + max) / 2 ? max : min)
    }
  }

  /** @param {PointerEvent} event */
  handlePointerDown = (event) => {
    const input = this.rangeInput
    if (input.disabled || event.button !== 0) return
    this.face.setPointerCapture(event.pointerId)
    input.focus({ preventScroll: true })
    this.valueAtDragStart = input.value
    this.toggleAttribute('data-dragging', true)
    this.setValueFromPointer(event)
  }

  /** @param {PointerEvent} event */
  handlePointerMove = (event) => {
    if (this.hasAttribute('data-dragging')) this.setValueFromPointer(event)
  }

  /** Fires `change` once at the end of a drag, as a native range does on release. */
  handleDragEnd = () => {
    const input = this.rangeInput
    this.removeAttribute('data-dragging')
    if (input.value !== this.valueAtDragStart) {
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  /**
   * Steps the value while the input has focus, so an unfocused dial never traps page scrolling.
   * @param {WheelEvent} event
   */
  handleWheel = (event) => {
    const input = this.rangeInput
    if (document.activeElement !== input || event.deltaY === 0) return
    event.preventDefault()
    const before = input.value
    if (event.deltaY < 0) {
      input.stepUp()
    } else {
      input.stepDown()
    }
    if (input.value === before) return
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

customElements.define('rkui-dial', RkuiDial)
