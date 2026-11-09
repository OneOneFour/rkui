# Third-party notices

rkui includes the following third-party work. Each vendored set keeps its own licence file next
to the files it covers.

| Work | Used for | Licence | Source |
|---|---|---|---|
| Phosphor Icons (duotone) | UI icons | MIT | https://github.com/phosphor-icons/core |
| Tabler Icons | Icons Phosphor lacks (e.g. satellite) | MIT | https://github.com/tabler/tabler-icons |
| Xmind | Body and UI typeface | SIL Open Font License 1.1 | https://github.com/xmindltd/nevermind |
| Roboto Slab | Heading typeface | Apache License 2.0 | https://github.com/google/fonts/tree/main/apache/robotoslab |
| JetBrains Mono | Monospace typeface | SIL Open Font License 1.1 | https://github.com/google/fonts/tree/main/ofl/jetbrainsmono |
| KaTeX and its maths fonts | Equation and Maths render TeX with it at build time. An optional peer dependency, not included: a site that uses them installs it | MIT | https://github.com/KaTeX/KaTeX |

## Docs site only

The docs site labels the language of its code specimens with logos from the `simple-icons`
package (a development dependency, drawn by `site/src/components/LanguageLogo.vue`), and marks the
helper scripts that only matter in Safari with Safari's (`site/src/components/HelperBadge.astro`).
They are not part of the library: CodeBlock takes its logo from the site that uses it.

| Work | Licence | Source |
|---|---|---|
| Simple Icons paths (C++, Fortran, Python, Safari) | CC0 1.0 | https://github.com/simple-icons/simple-icons |
| Simple Icons JavaScript path (the JS logo, by Christopher Williams) | MIT (below) | https://github.com/voodootikigod/logo.js |
| Simple Icons Markdown path (Markdown Mark, by Dustin Curtis) | CC0 1.0 | https://github.com/dcurtis/markdown-mark |

Simple Icons' CC0 dedication covers the SVG data, not the trademarks, which belong to their
owners. The logos are drawn unchanged in shape, flat in the caption's grey or the badge's text
colour, never in their brand colours: the PSF asks for permission before its logo's colours are
changed, and other brands' guidelines mostly allow only a black, white or grey version. Logos
under NonCommercial or ShareAlike terms (Julia, Vue, Rust, R) aren't used.

### The JS logo's licence

Simple Icons takes its JavaScript path from logo.js, under this licence:

```text
The MIT License (MIT)

Copyright (c) 2011 Christopher Williams <chris@iterativedesigns.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
