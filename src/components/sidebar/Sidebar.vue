<!--
  A sidebar: links grouped under headings, built from SidebarGroups of SidebarLinks, with no
  JavaScript. It scrolls on its own when it is taller than its box, so give it a height or a max
  height from the page. Hints at the top and bottom edges show when there is more to scroll to.
  `class`, `style` and other attributes go on the `<nav>`. The hints need Safari 26 or Firefox
  159. Only Chrome gives the card's and the note's stuck headings their stuck look; elsewhere they
  stick as they are.

  @example
  <Sidebar label="Docs">
    <SidebarGroup heading="Start">
      <SidebarLink href="/start/" current>Getting started</SidebarLink>
    </SidebarGroup>
  </Sidebar>
-->
<script setup lang="ts">
interface Props {
  /** The navigation's accessible name; two sidebars on a page need different ones. */
  label: string
  /**
   * The look: 'card', 'folders', 'deck' or 'note'; 'plain' when left out. Open, see DECISIONS
   * ("Sidebar").
   */
  variant?: 'plain' | 'card' | 'folders' | 'deck' | 'note'
}

const { label, variant = 'plain' } = defineProps<Props>()
</script>

<template>
  <nav
    :class="[
      'rkui-sidebar',
      {
        [`rkui-sidebar--${variant}`]: variant !== 'plain',
        'rkui-sticky-note rkui-sticky-note--tape': variant === 'note',
      },
    ]"
    :aria-label="label"
  >
    <div class="rkui-sidebar-scroll">
      <slot />
    </div>
    <span class="rkui-sidebar-more rkui-sidebar-more--above" aria-hidden="true"></span>
    <span class="rkui-sidebar-more rkui-sidebar-more--below" aria-hidden="true"></span>
  </nav>
</template>
