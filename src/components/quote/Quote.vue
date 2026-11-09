<!--
  An rkui quote: a `<blockquote>` on a slate panel, in the slab serif, as wide as the column it sits
  in, its edges in line with the text around it. The slot is the quoted text. With `by` it is a
  `<figure>` with the attribution in a `<figcaption>` under the quote, since an attribution belongs
  outside the `<blockquote>`. `class`, `style` and other attributes go on the outer element. It
  needs no JavaScript; with the helper script quote-enhance.js, a quote whose text is one line
  long in its column is set two steps larger, and one of two lines a step larger. A Markdown `>`
  quote renders as one where the page maps it: `<Content components={{ blockquote: Quote }} />`
  in Astro, or `export const components = { blockquote: Quote }` in an MDX file.

  @example
  <Quote by="Ada Lovelace"><p>The Analytical Engine weaves algebraic patterns.</p></Quote>
-->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Who said it, shown under the quote after a dash; none when left out. */
  by?: string
  /**
   * 'italic' slants the quote (the browser slants Roboto Slab, which has no italic); 'upright'
   * when left out.
   */
  slant?: 'upright' | 'italic'
  /**
   * Sets the quote two steps larger, as a one-line quote is, whatever its length; when left out,
   * the helper script sizes it by its length.
   */
  short?: boolean
}

const { by, slant = 'upright', short = false } = defineProps<Props>()

const classes = computed(() => [
  'rkui-quote',
  { 'rkui-quote--italic': slant === 'italic', 'rkui-quote--short': short },
])
</script>

<template>
  <figure v-if="by" :class="classes">
    <blockquote><slot /></blockquote>
    <figcaption class="rkui-quote-by">{{ by }}</figcaption>
  </figure>
  <blockquote v-else :class="classes">
    <slot />
  </blockquote>
</template>
