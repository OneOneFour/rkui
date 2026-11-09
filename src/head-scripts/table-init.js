// Paste this inline in <head>, as a classic script, beside theme-init.js, so it runs before the
// page is drawn. It marks the page so that tables keep their values hidden until their entrance
// plays (table.css, table-enhance.js), rather than showing them and then hiding them. If the
// entrance script hasn't taken over within 1.2 seconds, it removes the mark, so a table never stays
// blank. Under reduced motion it does nothing.
if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  document.documentElement.dataset.rkuiTables = 'pending'
  setTimeout(() => delete document.documentElement.dataset.rkuiTables, 1200)
}
