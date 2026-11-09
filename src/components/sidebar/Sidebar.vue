<!--
  A sidebar: links grouped under headings, built from SidebarGroups of SidebarLinks, with no
  JavaScript. The slot holds the SidebarGroups. It scrolls on its own when it is taller than its
  box, so give it a height or a max height from the page. Hints at the top and bottom edges show
  when there is more to scroll to. `class`, `style` and other attributes go on the `<nav>`. The
  hints need Safari 26 or Firefox 159. Only Chrome gives the card's and the note's stuck headings
  their stuck look; elsewhere they stick as they are. The `header` slot (`slot="header"` in Astro, `<template #header>` in Vue)
  sits above the links and doesn't scroll, for a site's name and tagline. `--rkui-sidebar-panel`
  in `style` sets the panel's colour.

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
  /** Sets the header, headings and links in the slab serif, in any look; false when left out. */
  slab?: boolean
  /**
   * Sets only the current page's link in the slab serif, with everything else in the UI font, in
   * any look; false when left out.
   */
  selectedSlab?: boolean
  /** Bolder links (weight 600), in any look; false when left out. */
  bold?: boolean
  /**
   * Lets the links flow into several columns when the sidebar is wide, as when it stacks above the
   * page on a phone, in any look; one column when left out, or when the sidebar is narrow. In a
   * flex column, give the sidebar an inline size (`inline-size: 100%`), or the browser keeps the
   * height of a single column.
   */
  columns?: boolean
  /**
   * The look of the hints at the top and bottom edges, written as `data-rkui-dots` on the `<nav>`:
   * 'plain' dots, or 'pill' for dots in a raised pill (a card's are always pills); the page's
   * setting when left out.
   */
  dots?: 'plain' | 'pill'
}

const { label, variant = 'plain', slab, selectedSlab, bold, columns, dots } = defineProps<Props>()
</script>

<template>
  <nav
    :class="[
      'rkui-sidebar',
      {
        [`rkui-sidebar--${variant}`]: variant !== 'plain',
        'rkui-sticky-note rkui-sticky-note--tape': variant === 'note',
        'rkui-sidebar--slab': slab,
        'rkui-sidebar--selected-slab': selectedSlab,
        'rkui-sidebar--bold': bold,
        'rkui-sidebar--columns': columns,
      },
    ]"
    :aria-label="label"
    :data-rkui-dots="dots"
  >
    <div v-if="$slots.header" class="rkui-sidebar-header">
      <slot name="header" />
    </div>
    <div class="rkui-sidebar-scroll">
      <slot />
    </div>
    <span class="rkui-sidebar-more rkui-sidebar-more--above" aria-hidden="true"></span>
    <span class="rkui-sidebar-more rkui-sidebar-more--below" aria-hidden="true"></span>
  </nav>
</template>
