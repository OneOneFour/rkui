// An Alert's buttons and `closedby="none"`, in browsers without invoker commands or `closedby`
// (Safari before 26.2): a button with `commandfor` naming an Alert opens it
// (`command="show-modal"`) or closes it (`command="close"`), and Escape leaves an Alert with
// `closedby="none"` open. In browsers without scroll-driven animations, it marks the page
// data-rkui-page-scrolls as an Alert opens, if the page scrolls, so alert.css keeps the
// scrollbar's space. It does nothing where the browser does these itself. It needs no
// eachElement(): each listener looks for its Alert only when a click, Escape or opening comes.

if (!('command' in HTMLButtonElement.prototype)) {
  document.addEventListener('click', (event) => {
    const button = /** @type {Element} */ (event.target).closest('button[commandfor]')
    const alert = button && document.getElementById(button.getAttribute('commandfor') ?? '')
    if (!(alert instanceof HTMLDialogElement) || !alert.matches('.rkui-alert')) return
    const command = button.getAttribute('command')
    if (command === 'show-modal' && !alert.open) alert.showModal()
    if (command === 'close') alert.close(/** @type {HTMLButtonElement} */ (button).value)
  })
}

if (!('closedBy' in HTMLDialogElement.prototype)) {
  document.addEventListener(
    'cancel',
    (event) => {
      if (/** @type {Element} */ (event.target).matches('.rkui-alert[closedby="none"]')) {
        event.preventDefault()
      }
    },
    true,
  )
}

if (!CSS.supports('animation-timeline: scroll()')) {
  document.addEventListener(
    'beforetoggle',
    (event) => {
      const dialog = /** @type {Element} */ (event.target)
      if (event.newState !== 'open' || !dialog.matches('.rkui-alert')) return
      const root = document.documentElement
      root.toggleAttribute('data-rkui-page-scrolls', root.scrollHeight > root.clientHeight)
    },
    true,
  )
}
