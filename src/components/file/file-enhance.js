// Shows the chosen files' names, joined with commas, inside a file drop panel, after a choice or a
// drop, and clears them when the form is reset. Without this script the panel still picks and
// submits files; it just shows its prompt. Delegated listeners serve every panel, including ones
// added later.

/**
 * Writes the names of a panel's chosen files into it, each name in a span so a long list wraps
 * between names, and marks the panel `data-rkui-chosen` while any are chosen.
 * @param {Element} panel a `.rkui-file-drop` label
 */
function showChosen(panel) {
  const input = panel.querySelector('input[type="file"]')
  const chosen = panel.querySelector('.rkui-file-drop-chosen')
  if (!(input instanceof HTMLInputElement) || !chosen) return
  const names = [...(input.files ?? [])].map((file) => file.name)
  const spans = names.map((name, index) => {
    const span = document.createElement('span')
    span.textContent = index < names.length - 1 ? `${name},` : name
    return span
  })
  chosen.replaceChildren(...spans.flatMap((span, index) => (index ? [' ', span] : [span])))
  panel.toggleAttribute('data-rkui-chosen', names.length > 0)
}

document.addEventListener('change', (event) => {
  const panel = /** @type {Element} */ (event.target).closest?.('.rkui-file-drop')
  if (panel) showChosen(panel)
})

// The reset event comes before the form clears its inputs, so the panels are read once it has. A
// microtask is too soon when a reset button is clicked: it runs as soon as this listener returns.
document.addEventListener('reset', (event) => {
  const form = /** @type {HTMLFormElement} */ (event.target)
  setTimeout(() => form.querySelectorAll('.rkui-file-drop').forEach(showChosen))
})
