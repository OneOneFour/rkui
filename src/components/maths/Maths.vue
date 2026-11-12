<!--
  Inline maths in running text: the TeX in `tex`, rendered by KaTeX on the server when the page is
  built, so it needs no JavaScript in the page. `\teal{…}` and the other term macros put a hue's
  tint behind a term, here and in `Equation`. `class`, `style` and other attributes go on the
  `<span>` around it.

  The site installs `katex`, sets `head: { styles: false }` in `rkui()` and imports
  'katex/dist/katex.min.css' and then rkui's `styles.css` in its layout. A TeX error stops the build.

  @example
  <p>With <Maths tex="\sigma = 10" /> and <Maths tex="\rho = 28" />, each <Maths tex="x_i(t)" /> stays bounded.</p>
-->
<script setup lang="ts">
import { computed } from 'vue'
import { renderMaths } from './render-maths'

interface Props {
  /**
   * The TeX source. In MDX write it as a quoted attribute, which keeps backslashes, braces and
   * underscores as they are.
   */
  tex: string
}

const { tex } = defineProps<Props>()

const html = computed(() => renderMaths(tex, false))
</script>

<template>
  <span v-html="html" />
</template>
