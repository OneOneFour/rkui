<script setup>
import { ref } from 'vue'
import Tile from '@oneonefour/rkui/components/tiles/Tile.vue'
import Tiles from '@oneonefour/rkui/components/tiles/Tiles.vue'

const ratings = ['1', '2', '3', '4', '5']
const rating = ref('3')
</script>

<template>
  <div class="widget">
    <Tiles v-model="rating" legend="Rating">
      <Tile v-for="value in ratings" :key="value" :value="value">{{ value }}</Tile>
    </Tiles>
    <p>Rating: {{ rating }} of 5</p>
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
