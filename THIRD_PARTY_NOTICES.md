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
package (a development dependency, drawn by `site/src/components/LanguageLogo.vue`). They are not
part of the library: CodeBlock takes its logo from the site that uses it.

| Work | Licence | Source |
|---|---|---|
| Simple Icons paths (C++, Fortran, Python) | CC0 1.0 | https://github.com/simple-icons/simple-icons |
| Simple Icons JavaScript path | MIT | https://github.com/simple-icons/simple-icons |
| Simple Icons Markdown path (Markdown Mark, by Dustin Curtis) | CC0 1.0 | https://github.com/dcurtis/markdown-mark |
| Julia logo (the Simple Icons path), by Stefan Karpinski | CC BY-NC-SA 4.0 | https://github.com/JuliaLang/julia-logo-graphics |

Simple Icons' CC0 dedication covers the SVG data, not the trademarks, which belong to their
owners. The logos are drawn unchanged in shape, in the caption's own flat grey, never in a hue:
the PSF asks for permission before its logo's colours are changed, and other brands' guidelines
mostly allow only a black, white or grey version. The Julia logo is shared under the CC BY-NC-SA
4.0 licence, so it must not be reused commercially and any copy must carry that licence. Logos
under NonCommercial or ShareAlike terms that aren't credited here (Vue, Rust, R) aren't used.
