import { timeOf } from './css-time.js'

/**
 * Runs `callback` once a segmented control's sliding pill has reached the newly checked option:
 * after `--rkui-duration-slide`, read where the control is, so it is immediate under reduced
 * motion. Use it when checking an option restyles the whole page (a theme or palette switch), which
 * can otherwise cut the slide short.
 *
 * @param {Element} control the `.rkui-segmented` group, or any element inside it
 * @param {() => void} callback
 */
export function afterSlide(control, callback) {
  setTimeout(callback, timeOf(control, '--rkui-duration-slide'))
}
