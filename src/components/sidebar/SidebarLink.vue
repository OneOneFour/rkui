<!--
  One link in a SidebarGroup, in its own list item. The slot is the link text; an optional icon
  (`slot="icon"` in Astro, `<template #icon>` in Vue) sits before it. `class`, `style` and other
  attributes go on the `<li>`.

  @example
  <SidebarLink href="/notes/" hue="coral" current><PenNib slot="icon" />Notes</SidebarLink>
-->
<script setup lang="ts">
import { computed } from 'vue'
import { hueVars, type HueOrHex } from '../../shared/hues'

interface Props {
  /** Where the link goes. */
  href: string
  /** Marks the link as the current page; false when left out. */
  current?: boolean
  /**
   * The link's own colour, a hue or a hex code, such as the section colour of the page it leads
   * to. It fills the link's icon, and the link itself when it is the current page, in any look.
   * The look's own colours when left out.
   */
  hue?: HueOrHex
}

const { href, current, hue } = defineProps<Props>()

/** The link's colour and the text on it as custom properties, when `hue` is set. */
const vars = computed(() =>
  hueVars(hue, { fill: '--rkui-sidebar-hue', text: '--rkui-sidebar-on-hue', solid: true }),
)
</script>

<template>
  <li>
    <a
      :class="['rkui-sidebar-link', { 'rkui-sidebar-link--hue': hue }]"
      :style="vars"
      :href="href"
      :aria-current="current ? 'page' : undefined"
    >
      <slot name="icon" />
      <slot />
    </a>
  </li>
</template>
