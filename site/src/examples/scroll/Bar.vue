<script setup>
import Scroll from '@oneonefour/rkui/components/overflow/Scroll.vue'
</script>

<template>
  <Scroll bar label="Long line" class="line-scroll">
    <p>
      A long line of text that does not wrap, so the region scrolls sideways when it is too wide for
      its column, and the scrollbar stays in view.
    </p>
  </Scroll>
</template>

<style scoped>
.line-scroll {
  max-inline-size: 100%;
}

p {
  margin: 0;
  white-space: nowrap;
}
</style>
