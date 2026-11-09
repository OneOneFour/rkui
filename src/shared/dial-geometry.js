/**
 * Geometry shared by the clock and dial faces, which Clock.vue and Dial.vue draw. No DOM: every
 * function takes numbers and returns numbers, strings or plain objects. Angles are degrees
 * clockwise from 12 o'clock.
 */

/** A face's SVG is drawn in a square of this many units, centred on (CENTRE, CENTRE). */
export const VIEWBOX = 200
export const CENTRE = VIEWBOX / 2

/**
 * @param {number} value
 * @param {number} divisor
 * @returns {number} `value` modulo `divisor`, never negative
 */
export function wrap(value, divisor) {
  return ((value % divisor) + divisor) % divisor
}

/**
 * @param {number} previous the angle a hand points at now, which may be past 360 or below 0
 * @param {number} angle the way it should point next, from 0 to 360
 * @returns {number} the angle nearest `previous` that points the same way as `angle`, so the
 *   hand takes the short way round instead of spinning back past 12
 */
export function nearestTurn(previous, angle) {
  return previous + wrap(angle - previous + 180, 360) - 180
}

/**
 * @param {number} value
 * @returns {number} the value to a thousandth of an SVG unit. The server and the browser can
 *   differ in a sine's last digit; rounded, they write the same markup.
 */
function round(value) {
  return Math.round(value * 1000) / 1000
}

/**
 * @param {number} radius
 * @param {number} angle
 * @returns {{ x: number, y: number }} the point in the SVG at `radius` and `angle` from the centre
 */
export function polarToCartesian(radius, angle) {
  const radians = (angle * Math.PI) / 180
  return {
    x: round(CENTRE + radius * Math.sin(radians)),
    y: round(CENTRE - radius * Math.cos(radians)),
  }
}

/**
 * @param {number} radius
 * @param {number} angle
 * @returns {{ x: number, y: number }} the same point as a percentage of the face's width and
 *   height, for CSS to centre an element on it
 */
export function percentOfFace(radius, angle) {
  const { x, y } = polarToCartesian(radius, angle)
  return { x: (x * 100) / VIEWBOX, y: (y * 100) / VIEWBOX }
}

/**
 * @param {number} radius
 * @param {number} fromAngle
 * @param {number} toAngle
 * @returns {string} SVG path data for a clockwise arc
 */
export function arcPath(radius, fromAngle, toAngle) {
  const start = polarToCartesian(radius, fromAngle)
  const end = polarToCartesian(radius, toAngle)
  const largeArc = toAngle - fromAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

/**
 * @param {number} innerRadius
 * @param {number} outerRadius
 * @param {number} angle
 * @returns {{ x1: number, y1: number, x2: number, y2: number }} the ends of an SVG `<line>`
 *   pointing out from the centre, between the two radii
 */
export function radialLine(innerRadius, outerRadius, angle) {
  const inner = polarToCartesian(innerRadius, angle)
  const outer = polarToCartesian(outerRadius, angle)
  return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y }
}

/**
 * @param {number} dx distance right of the centre
 * @param {number} dy distance below the centre
 * @returns {number} the angle of that point, from -180 to 180
 */
export function pointToAngle(dx, dy) {
  return (Math.atan2(dx, -dy) * 180) / Math.PI
}
