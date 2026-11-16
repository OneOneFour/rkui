/**
 * The maths behind LightDirection. No DOM. Angles are in degrees, clockwise from 12 o'clock, and
 * name where the light comes from.
 */

/** Where the light comes from by default: the top left. */
export const DEFAULT_ANGLE = 315

const SUNRISE_HOUR = 6
const SUNSET_HOUR = 18
/** The sun rises on the left, at 9 o'clock. */
const SUNRISE_ANGLE = 270

/** Where each eighth of the circle lies, from the top round clockwise, as the value text says. */
const DIRECTIONS = [
  'top',
  'top right',
  'right',
  'bottom right',
  'bottom',
  'bottom left',
  'left',
  'top left',
]

/**
 * The sun rises on the left at 6:00, is overhead at noon and sets on the right at 18:00, so 9:00
 * gives the default angle. At night the light goes back to the default.
 * @param {Date} time
 * @returns {number} the light angle at `time`
 */
export function sunAngle(time) {
  const hour = time.getHours() + time.getMinutes() / 60
  const dayFraction = (hour - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR)
  if (dayFraction < 0 || dayFraction > 1) return DEFAULT_ANGLE
  return (SUNRISE_ANGLE + 180 * dayFraction) % 360
}

/**
 * @param {number | string} value an angle in degrees, any number of turns round
 * @returns {number} the same angle in whole degrees, from 0 to 359
 */
export function wholeAngle(value) {
  const degrees = Math.round(Number(value))
  return ((degrees % 360) + 360) % 360
}

/**
 * @param {number} angle a light angle, from 0 to 359
 * @returns {string} where the light comes from, in words: "top left", to the nearest eighth
 */
export function directionName(angle) {
  return DIRECTIONS[Math.round(angle / 45) % DIRECTIONS.length]
}
