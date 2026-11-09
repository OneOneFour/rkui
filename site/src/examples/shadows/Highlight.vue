<script setup>
import Checkbox from '@oneonefour/rkui/components/checkbox/Checkbox.vue'
import Input from '@oneonefour/rkui/components/input/Input.vue'
</script>

<template>
  <div v-for="highlight in ['cream', 'dark']" :key="highlight" class="dark" :data-highlight="highlight">
    <p class="name">
      <code>data-highlight="{{ highlight }}"</code>
    </p>
    <Input :name="`highlight-${highlight}`" placeholder="An input" />
    <Checkbox :name="`highlight-${highlight}-check`">A checkbox</Checkbox>
  </div>
</template>

<style scoped>
/* A dark page inside this one: light-dark() takes its dark colours here. */
.dark {
  display: grid;
  justify-items: start;
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
</style>
