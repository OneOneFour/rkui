/* Safari drops :focus-visible from a radio that an arrow key moves focus to, so the focus band
   on Tabs, Segmented, Tiles and the other radio groups (interactive.css) disappears. This marks
   such a radio with data-rkui-focus-visible, and the CSS shows the band for a marked radio that
   has focus. Where the radio still matches :focus-visible, nothing is marked. */
const MARK = 'data-rkui-focus-visible'

document.addEventListener('keydown', () => {
  const before = document.activeElement
  // The arrow key moves focus after its keydown listeners have run.
  requestAnimationFrame(() => {
    const radio = document.activeElement
    if (radio !== before && radio?.matches('input[type="radio"]:not(:focus-visible)')) {
      radio.setAttribute(MARK, '')
    }
  })
})

// Each move of focus clears the mark, which the arrow key's frame then sets again. A blur
// wouldn't do: Safari fires none when a focused radio is removed.
document.addEventListener('focusin', () =>
  document.querySelector(`[${MARK}]`)?.removeAttribute(MARK),
)
