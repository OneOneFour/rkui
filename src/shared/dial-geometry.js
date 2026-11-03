/**
 * Geometry shared by the clock and dial faces, for the elements in the browser and the Astro
 * components at build time. No DOM: every function takes numbers and returns numbers or strings.
 * Angles are degrees clockwise from 12 o'clock.
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
 * @param {number} radius
 * @param {number} angle
 * @returns {{ x: number, y: number }} the point in the SVG at `radius` and `angle` from the centre
 */
export function polarToCartesian(radius, angle) {
  const radians = (angle * Math.PI) / 180
  return { x: CENTRE + radius * Math.sin(radians), y: CENTRE - radius * Math.cos(radians) }
}

/**
 * @param {number} radius
 * @param {number} angle
 * @returns {{ x: number, y: number }} the same point as a percentage of the face's width and
 *   height, for CSS to centre an element on it
 */
export function percentOfFace(radius, angle) {
  const { x, y } = polarToCartesian(radius, angle)
  return { x: (x / VIEWBOX) * 100, y: (y / VIEWBOX) * 100 }
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
 * @param {string} className
 * @param {number} innerRadius
 * @param {number} outerRadius
 * @param {number} angle
 * @returns {string} an SVG `<line>` pointing out from the centre, between the two radii
 */
export function radialLine(className, innerRadius, outerRadius, angle) {
  const inner = polarToCartesian(innerRadius, angle)
  const outer = polarToCartesian(outerRadius, angle)
  return `<line class="${className}" x1="${inner.x}" y1="${inner.y}" x2="${outer.x}" y2="${outer.y}"/>`
}
