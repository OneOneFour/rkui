<script setup>
import Button from '@oneonefour/rkui/components/button/Button.vue'
</script>

<template>
  <figure>
    <Button hue="teal">Button</Button>
    <figcaption>--rkui-duration-fast, ease: lifts on hover, sinks on press</figcaption>
  </figure>
  <figure class="reduced">
    <Button hue="teal">Button</Button>
    <figcaption>Reduced motion: the shadow changes, nothing moves</figcaption>
  </figure>
</template>

<style scoped>
figure {
  display: grid;
  justify-items: start;
  gap: var(--rkui-space-2);
  margin: 0;
}

figcaption {
  color: var(--rkui-muted);
  font-size: var(--rkui-step--1);
}

/* The tokens' reduced-motion values, set here all the time to show the difference. */
.reduced .rkui-button {
  --rkui-duration-fast: 0ms;
  --rkui-lift-offset: 0px;
  --rkui-press-offset: 0px;
}
</style>
