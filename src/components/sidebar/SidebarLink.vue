<!--
  One link in a SidebarGroup, in its own list item. The slot is the link text, with an optional
  icon before it. `class`, `style` and other attributes go on the `<li>`.

  @example
  <SidebarLink href="/button/" current>Button</SidebarLink>
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
   * The section colour of the page it leads to, a hue or a hex code. The 'sections' sidebar fills
   * the link's icon with it, and the link itself when it is the current page; other looks don't
   * show it. The page's section hue (`--rkui-section`) when left out.
   */
  hue?: HueOrHex
}

const { href, current, hue } = defineProps<Props>()

/** The link's section colour and its text as custom properties, when `hue` is set. */
const vars = computed(() =>
  hueVars(hue, { fill: '--rkui-section', text: '--rkui-on-section', solid: true }),
)
</script>

<template>
  <li :style="vars">
    <a class="rkui-sidebar-link" :href="href" :aria-current="current ? 'page' : undefined">
      <slot />
    </a>
  </li>
</template>
