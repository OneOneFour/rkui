// Lets a drawer animate shut in Safari, which stops drawing a <details>'s contents the moment it
// closes. Where the browser keeps drawing them while drawer.css animates the close (Chrome), it
// does nothing. Otherwise the click that would close an open drawer marks it data-rkui-closing
// instead, which drawer.css styles as shut, and the drawer closes for real once its tray has
// moved. Opening a drawer closes the open ones sharing its name the same way: each loses its name
// while it closes, so the browser doesn't shut it at once. One listener serves every drawer on
// the page, including drawers added later. Enter and Space on a summary are clicks too.
//
// It also lets a remote drawer behave like a popover from the keyboard: Escape inside it shuts it,
// and when it shuts with focus inside, focus goes back to the button that opens it.

const CLOSING = 'data-rkui-closing'
/** @type {WeakMap<HTMLDetailsElement, { timer: number, name: string }>} each closing drawer */
const closing = new WeakMap()
/** @type {boolean | undefined} whether this browser needs the help, found on the first click */
let needed

/**
 * Whether the browser stops drawing a drawer's contents the moment it closes, tried on a drawer
 * out of sight with a long closing move.
 */
function hidesAtOnce() {
  const box = document.createElement('div')
  box.style.cssText = 'position: fixed; inset-inline-start: -200vw; --rkui-duration-spring: 1s'
  box.innerHTML = '<details class="rkui-drawer" open><summary></summary><p>.</p></details>'
  document.body.append(box)
  const drawer = box.firstElementChild
  drawer.getBoundingClientRect()
  drawer.open = false
  const drawn = drawer.lastElementChild.checkVisibility?.() ?? false
  box.remove()
  return !drawn
}

/** The longest transition on the drawer's tray, delay included, in milliseconds. */
function trayMoveTime(drawer) {
  const style = getComputedStyle(drawer, '::details-content')
  const durations = style.transitionDuration.split(',').map(parseFloat)
  const delays = style.transitionDelay.split(',').map(parseFloat)
  return Math.max(...durations.map((duration, i) => duration + (delays[i] ?? 0))) * 1000
}

/** Animates an open drawer shut, then closes it and gives back its name. */
function closeSlowly(drawer) {
  const name = drawer.getAttribute('name') ?? ''
  drawer.removeAttribute('name')
  drawer.setAttribute(CLOSING, '')
  const timer = setTimeout(() => {
    closing.delete(drawer)
    drawer.removeAttribute(CLOSING)
    drawer.open = false
    if (name) drawer.setAttribute('name', name)
  }, trayMoveTime(drawer))
  closing.set(drawer, { timer, name })
}

/** Closes the open drawers that share this drawer's name, as the browser would. */
function closeOthers(drawer, name) {
  if (!name) return
  const selector = `details.rkui-drawer[open][name="${CSS.escape(name)}"]`
  for (const other of document.querySelectorAll(selector)) {
    if (other !== drawer) closeSlowly(other)
  }
}

document.addEventListener('click', (event) => {
  // A page that cancels the click keeps the drawer as it is.
  if (event.defaultPrevented) return
  const handle = event.target instanceof Element && event.target.closest('.rkui-drawer-handle')
  const drawer = handle && handle.parentElement
  if (!(drawer instanceof HTMLDetailsElement)) return
  needed ??= hidesAtOnce()
  if (!needed) return

  const state = closing.get(drawer)
  if (state) {
    // A click while it closes opens it again, from where it is.
    event.preventDefault()
    clearTimeout(state.timer)
    closing.delete(drawer)
    drawer.removeAttribute(CLOSING)
    closeOthers(drawer, state.name)
    if (state.name) drawer.setAttribute('name', state.name)
  } else if (drawer.open) {
    event.preventDefault()
    closeSlowly(drawer)
  } else {
    closeOthers(drawer, drawer.getAttribute('name'))
  }
})

/** The button outside a remote drawer that opens it, found by its popovertarget. */
function opener(drawer, id) {
  const buttons = document.querySelectorAll(`[popovertarget="${CSS.escape(id)}"]`)
  return [...buttons].find((button) => !drawer.contains(button))
}

// A remote drawer shuts on Escape while focus is inside it, as a popover does.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || event.defaultPrevented) return
  const drawer = event.target instanceof Element && event.target.closest('.rkui-drawer--remote')
  const toggle = drawer && drawer.querySelector(':scope > .rkui-drawer-switch:popover-open')
  if (toggle) toggle.hidePopover()
})

// A remote drawer that shuts with focus inside it hands focus back to its button, as a popover
// does, so the focus isn't lost as the tray hides. The toggle event doesn't bubble, so this
// listens as it passes down to the switch.
document.addEventListener(
  'toggle',
  (event) => {
    const toggle = event.target
    if (event.newState !== 'closed' || !(toggle instanceof Element)) return
    if (!toggle.matches('.rkui-drawer--remote > .rkui-drawer-switch')) return
    const drawer = toggle.parentElement
    if (drawer.contains(document.activeElement)) opener(drawer, toggle.id)?.focus()
  },
  true,
)
