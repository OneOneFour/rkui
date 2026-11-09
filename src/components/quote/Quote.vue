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
interface Props {
  /** Who said it, shown under the quote after a dash; none when left out. */
  by?: string
  /**
   * 'italic' slants the quote (the browser slants Roboto Slab, which has no italic); 'upright'
   * when left out.
   */
  slant?: 'upright' | 'italic'
}

const { by, slant = 'upright' } = defineProps<Props>()
</script>

<template>
  <figure v-if="by" :class="['rkui-quote', { 'rkui-quote--italic': slant === 'italic' }]">
    <blockquote><slot /></blockquote>
    <figcaption class="rkui-quote-by">{{ by }}</figcaption>
  </figure>
  <blockquote v-else :class="['rkui-quote', { 'rkui-quote--italic': slant === 'italic' }]">
    <slot />
  </blockquote>
</template>
