// Paste this inline at the top of <head>, as a classic script, so it runs before the page is drawn.
// It puts back each setting a reader chose with ThemeToggle, LightDirection or the site's own
// controls, stored under rkui-<setting>. Edit the line below to list the settings the site lets
// readers change: only those are put back, so a choice made on another site on the same domain
// doesn't override this site's. A stored choice that is no longer a value is skipped. The site's
// fixed settings go on <html> itself, such as <html data-palette="slate">. In an Astro site,
// rkui() writes the line from its `settings` option and the fixed settings on <html>.
{
  const switchable = ['theme']

  // Each setting's attribute, then its values: a copy of SETTINGS in src/shared/settings.js, which
  // the build checks. The light is an angle, so it has none.
  const settings = {
    theme: ['data-theme', 'system', 'light', 'dark'],
    palette: ['data-palette', 'cream', 'slate', 'greige'],
    shadow: ['data-shadow', 'outline', 'block', 'color'],
    highlight: ['data-highlight', 'cream', 'dark'],
    dots: ['data-rkui-dots', 'plain', 'pill'],
  }
  const root = document.documentElement

  const set = (name, value) => {
    if (name === 'light') {
      const angle = parseFloat(value)
      if (Number.isFinite(angle)) root.style.setProperty('--rkui-light-angle', `${angle}deg`)
      return
    }
    const [attribute, ...values] = settings[name] ?? []
    if (!values.includes(value)) return
    // The "system" theme is no attribute: the page follows the OS.
    if (value === 'system') root.removeAttribute(attribute)
    else root.setAttribute(attribute, value)
  }

  try {
    for (const name of switchable) {
      const value = localStorage.getItem(`rkui-${name}`)
      if (value !== null) set(name, value)
    }
  } catch {
    // Storage is blocked, so the page keeps the site's own settings.
  }
}
