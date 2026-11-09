// Paste this inline at the top of <head>, as a classic script, so it runs before the page is drawn.
// It applies the reader's stored light or dark choice; with none, the page follows the OS.
try {
  const theme = localStorage.getItem('rkui-theme')
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.dataset.theme = theme
  }
} catch {
  // Storage is blocked (some private modes), so follow the OS.
}
