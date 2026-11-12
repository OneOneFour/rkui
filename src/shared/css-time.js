/**
 * A time held in a custom property, in milliseconds: '320ms' is 320 and '1.2s' is 1200; 0 when it
 * holds no time.
 * @param {Element} element the element whose value is read
 * @param {string} property e.g. '--rkui-duration-slide'
 */
export function timeOf(element, property) {
  const written = getComputedStyle(element).getPropertyValue(property).trim()
  const milliseconds = written.endsWith('ms') ? parseFloat(written) : parseFloat(written) * 1000
  return Number.isFinite(milliseconds) ? milliseconds : 0
}
