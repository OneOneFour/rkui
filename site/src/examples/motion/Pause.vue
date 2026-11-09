<script setup>
import Dots from '@oneonefour/rkui/components/spinner-dots/Dots.vue'
import Flask from '@oneonefour/rkui/components/water/Flask.vue'
import Loader from '@oneonefour/rkui/components/loader/Loader.vue'
import Motion from '@oneonefour/rkui/components/motion/Motion.vue'
import Spinner from '@oneonefour/rkui/components/spinner/Spinner.vue'
</script>

<template>
  <Motion>
    <div class="loops">
      <Spinner />
      <Dots />
      <Flask />
      <Loader />
    </div>
  </Motion>
</template>

<style scoped>
.loops {
  margin-block-start: var(--rkui-space-4);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rkui-space-6);
}
</style>
