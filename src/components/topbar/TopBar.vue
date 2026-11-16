<!--
  A top bar: controls that stay at the top of the window as the page scrolls. The slot holds the
  controls, after a `TopBarNav` of page links if there is one; put a `BackToTop` last. `class`,
  `style` and other attributes go on the `<header>`. In Safari before 26 and Firefox before 159
  the bar and its link show in full from the start.

  @example
  <TopBar><ThemeToggle client:visible /><BackToTop /></TopBar>
-->
<script setup lang="ts">
interface Props {
  /**
   * Full width along the top edge with a rule and a shadow, for headers such as an article's title;
   * a raised toast at the end of the line when left out.
   */
  flush?: boolean
}

const { flush } = defineProps<Props>()
</script>

<template>
  <header :class="['rkui-topbar', flush ? 'rkui-topbar--flush' : 'rkui-topbar--toast']">
    <slot />
  </header>
</template>
