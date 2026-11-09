<script setup>
import Scroll from '@oneonefour/rkui/components/overflow/Scroll.vue'
</script>

<template>
  <Scroll label="Plain dots" class="line-scroll">
    <p>
      Plain dots: a long line of text that does not wrap, so the region scrolls sideways when it is
      too wide for its column.
    </p>
  </Scroll>
  <Scroll label="Pill dots" class="line-scroll" dots="pill">
    <p>
      Pill dots: a long line of text that does not wrap, so the region scrolls sideways when it is
      too wide for its column.
    </p>
  </Scroll>
</template>

<style scoped>
.line-scroll {
  max-inline-size: 100%;
  padding-block: var(--rkui-space-2);
}

p {
  margin: 0;
  white-space: nowrap;
}
</style>
