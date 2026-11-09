// Shows the chosen file's name, or "3 files", inside a file drop panel, after a choice or a drop.
// Without this script the panel still picks and submits files; it just shows its prompt. One
// delegated listener serves every panel, including ones added later.
document.addEventListener('change', (event) => {
  const input = /** @type {HTMLInputElement} */ (event.target)
  const panel = input.closest?.('.rkui-file-drop')
  const chosen = panel?.querySelector('.rkui-file-drop-chosen')
  if (!chosen || input.type !== 'file') return
  const files = input.files ?? []
  chosen.textContent = files.length > 1 ? `${files.length} files` : (files[0]?.name ?? '')
  panel?.toggleAttribute('data-rkui-chosen', files.length > 0)
})
