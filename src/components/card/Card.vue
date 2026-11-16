<!--
  An rkui card: an `<article>` with a title and a body. With `href` and `title` the whole card is
  one link (its title), outlined, with the hard shadow and the pop; otherwise it is a static panel
  that never lifts, its edge set by `variant`. The slot is the body; the `image` slot holds an
  `<img class="rkui-card-image">` or similar (`slot="image"` in Astro, `<template #image>` in Vue).
  The `heading` slot fills a static card's heading in place of `title`, and may hold controls
  (`slot="heading"` in Astro, `<template #heading>` in Vue). With neither, the card has no heading:
  name it with `aria-label` or `aria-labelledby`. `class`, `style` and other attributes go on the
  `<article>`.

  @example
  <Card title="Field notes" href="/notes/" meta="Updated today" hue="teal"><p>Recent entries.</p></Card>
-->
<script setup lang="ts">
import { computed } from 'vue'
import { hueVars, type HueOrHex } from '../../shared/hues'

interface Props {
  /**
   * The card's title, and the link text when linked: a card is a link only when it has both
   * `href` and `title`. No heading when left out, unless the `heading` slot fills it.
   */
  title?: string
  /** Where the card links to, when it has a `title` too; a static panel when left out. */
  href?: string
  /** A short line under the title; none when left out. */
  meta?: string
  /** The title's heading level, to fit the page outline; 3 when left out. */
  headingLevel?: 2 | 3 | 4
  /**
   * A static card's edge: 'raised' (the outline and a hard shadow that doesn't lift), 'shaded' (a
   * panel fill with no outline) or 'inset' (pushed into the page); 'outline' when left out. A
   * linked card ignores it.
   */
  variant?: 'outline' | 'raised' | 'shaded' | 'inset'
  /**
   * The colour its hard shadow takes with `data-shadow="color"` in dark mode, such as one from its
   * image: a palette hue or a hex code. Only a linked or raised card has a hard shadow, and the
   * other shadows keep theirs; `--rkui-shadow-lit` when left out.
   */
  hue?: HueOrHex
}

const { title, href, meta, headingLevel = 3, variant = 'outline', hue } = defineProps<Props>()

/** Whether the card is one link: it needs a title for the link text. */
const linked = computed(() => Boolean(href && title))

/** The card's modifier: the link, or a static card's variant. */
const look = computed(() => (linked.value ? 'rkui-card--link' : `rkui-card--${variant}`))

/** The hue its colour-mode shadow is mixed from. */
const vars = computed(() => hueVars(hue, { fill: '--rkui-card-hue' }))
</script>

<template>
  <article :class="['rkui-card', look]" :style="vars">
    <slot name="image" />
    <div class="rkui-card-body">
      <component :is="`h${headingLevel}`" v-if="title || $slots.heading" class="rkui-card-title">
        <a v-if="linked" class="rkui-card-link" :href="href">{{ title }}</a>
        <slot v-else name="heading">{{ title }}</slot>
      </component>
      <p v-if="meta" class="rkui-card-meta">{{ meta }}</p>
      <slot />
    </div>
  </article>
</template>
