<script setup>
import Badge from '@oneonefour/rkui/components/badge/Badge.vue'
import Button from '@oneonefour/rkui/components/button/Button.vue'
import Card from '@oneonefour/rkui/components/card/Card.vue'
</script>

<template>
  <div v-for="shadow in ['outline', 'block', 'color']" :key="shadow" class="dark" :data-shadow="shadow">
    <p class="name">
      <code>data-shadow="{{ shadow }}"</code>
    </p>
    <div class="things">
      <Button hue="coral">Coral</Button>
      <Button>Yellow</Button>
      <Badge hue="teal">Teal</Badge>
      <Card title="Raised" variant="raised" hue="grape" style="inline-size: 9rem">
        <p>Grape hue.</p>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* A dark page inside this one: light-dark() takes its dark colours here. */
.dark {
  display: grid;
  gap: var(--rkui-space-3);
  padding: var(--rkui-space-5);
  border-radius: var(--rkui-radius);
  color-scheme: dark;
  background: var(--rkui-surface);
  color: var(--rkui-fg);
}

.name {
  margin: 0;
}

.things {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rkui-space-5);
}
</style>
