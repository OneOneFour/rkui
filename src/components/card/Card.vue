<!--
  An rkui card: an `<article>` with a title and a body. With `href` the whole card is one link (its
  title); without, it is a static panel. Slots: `image` (an <img class="rkui-card-image"> or
  similar; `slot="image"` in Astro, `<template #image>` in Vue) and the default slot for the body.
  `class`, `style` and other attributes go on the `<article>`.

  @example
  <Card title="Field notes" href="/notes/" meta="Updated today"><p>Recent entries.</p></Card>
-->
<script setup lang="ts">
interface Props {
  /** The card's title, and the link text when linked. */
  title: string
  /** Where the card links to; a static panel when left out. */
  href?: string
  /** A short line under the title; none when left out. */
  meta?: string
  /** The title's heading level, to fit the page outline; 3 when left out. */
  headingLevel?: 2 | 3 | 4
}

const { title, href, meta, headingLevel = 3 } = defineProps<Props>()
</script>

<template>
  <article :class="['rkui-card', { 'rkui-card--link': href }]">
    <slot name="image" />
    <div class="rkui-card-body">
      <component :is="`h${headingLevel}`" class="rkui-card-title">
        <a v-if="href" class="rkui-card-link" :href="href">{{ title }}</a>
        <template v-else>{{ title }}</template>
      </component>
      <p v-if="meta" class="rkui-card-meta">{{ meta }}</p>
      <slot />
    </div>
  </article>
</template>
