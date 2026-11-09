<script setup>
import { ref } from 'vue'
import Button from '@oneonefour/rkui/components/button/Button.vue'
import WidgetTab from '@oneonefour/rkui/components/folder/WidgetTab.vue'
import WidgetTabs from '@oneonefour/rkui/components/folder/WidgetTabs.vue'

const topics = ['One', 'Two', 'Three']
const current = ref(0)
</script>

<template>
  <div class="widget">
    <WidgetTabs v-model="current" label="Topics">
      <WidgetTab v-for="(topic, i) in topics" :key="topic" :label="topic">
        <p>Panel {{ i + 1 }}.</p>
      </WidgetTab>
    </WidgetTabs>
    <p class="readout">
      Selected: {{ topics[current] }}
      <Button small @click="current = (current + 1) % topics.length">Next tab</Button>
    </p>
  </div>
</template>

<style scoped>
.widget {
  display: grid;
  gap: var(--rkui-space-4);
}

.readout {
  display: flex;
  align-items: center;
  gap: var(--rkui-space-3);
  margin: 0;
}
</style>
