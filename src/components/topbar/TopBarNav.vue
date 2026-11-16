<!--
  A row of page links for a TopBar: a named `<nav>` holding a list in a Scroll region. The slot
  holds the TopBarLinks; the page marks the current one with `current`. It sits at the start of
  the bar, before the controls, and scrolls sideways when the links don't fit. On a narrow screen
  it takes a second row of its own. `topbar-nav-enhance.js` opens the line scrolled to the current
  link. The region has no name of its own and no tab stop: tabbing to a link scrolls it into view.
  `class`, `style` and other attributes go on the `<nav>`. It needs no JavaScript.

  @example
  <TopBar flush>
    <TopBarNav label="Site">
      <TopBarLink href="/" current>Home</TopBarLink>
      <TopBarLink href="/notes/">Notes</TopBarLink>
    </TopBarNav>
    <ThemeToggle icon-only client:visible />
  </TopBar>
-->
<script setup lang="ts">
import Scroll from '../overflow/Scroll.vue'

interface Props {
  /** The navigation's name for screen readers, such as "Site". */
  label: string
}

const { label } = defineProps<Props>()
</script>

<template>
  <nav class="rkui-topbar-nav" :aria-label="label">
    <Scroll tabindex="-1">
      <ul class="rkui-topbar-nav-list">
        <slot />
      </ul>
    </Scroll>
  </nav>
</template>
