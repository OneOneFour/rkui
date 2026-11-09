<script setup>
import Dots from '@oneonefour/rkui/components/spinner-dots/Dots.vue'
import Flask from '@oneonefour/rkui/components/water/Flask.vue'
import Motion from '@oneonefour/rkui/components/motion/Motion.vue'
import Spinner from '@oneonefour/rkui/components/spinner/Spinner.vue'
</script>

<template>
  <div class="groups">
    <Motion class="group">
      <div class="loops">
        <Spinner />
        <Dots />
      </div>
    </Motion>
    <Motion class="group">
      <div class="loops">
        <Flask />
        <Dots />
      </div>
    </Motion>
    <div class="outside">
      <Spinner />
      <p>Outside both groups</p>
    </div>
  </div>
</template>

<style scoped>
.groups {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  gap: var(--rkui-space-6);
}

.loops,
.outside {
  margin-block-start: var(--rkui-space-4);
  display: flex;
  align-items: center;
  gap: var(--rkui-space-4);
}
</style>
