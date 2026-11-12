<script setup>
import { ref } from 'vue'
import Segmented from '@oneonefour/rkui/components/segmented/Segmented.vue'
import SegmentedOption from '@oneonefour/rkui/components/segmented/SegmentedOption.vue'

const view = ref('grid')
</script>

<template>
  <div class="widget">
    <Segmented v-model="view" legend="View">
      <SegmentedOption value="list">List</SegmentedOption>
      <SegmentedOption value="grid">Grid</SegmentedOption>
      <SegmentedOption value="map">Map</SegmentedOption>
    </Segmented>
    <p>View: {{ view }}</p>
  </div>
</template>

<style scoped>
.widget {
  display: grid;
  gap: var(--rkui-space-3);
  justify-items: start;
}

p {
  margin: 0;
}
</style>
