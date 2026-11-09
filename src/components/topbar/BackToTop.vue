<!--
  The back-to-top link: an icon `Button` for the end of a `TopBar`, with a visually hidden label.
  It takes no props. `class`, `style` and other attributes go on the `<a>`.

  @example
  <TopBar><BackToTop /></TopBar>
-->
<script setup lang="ts">
import ArrowUpIcon from '@oneonefour/rkui/icons/arrow-up.vue'
import Button from '../button/Button.vue'
</script>

<template>
  <Button href="#top" class="rkui-back-to-top">
    <ArrowUpIcon class="rkui-icon" />
    <span class="rkui-visually-hidden">Back to top</span>
  </Button>
</template>
