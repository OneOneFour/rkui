<script setup>
import { ref } from 'vue'
import Range from '@oneonefour/rkui/components/range/Range.vue'

const opacity = ref(0.28)
</script>

<template>
  <div class="readout">
    <Range v-model="opacity" class="slider" label="Opacity" min="0" max="1" step="0.01" />
    <output>{{ opacity.toFixed(2) }}</output>
  </div>
</template>

<style scoped>
.readout {
  display: flex;
  align-items: end;
  gap: var(--rkui-space-3);
  max-inline-size: 30rem;
}

.slider {
  flex: 1;
}

output {
  min-inline-size: 5ch;
  padding-block-end: var(--rkui-space-2);
  font-family: var(--rkui-font-mono);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  text-align: end;
}
</style>
