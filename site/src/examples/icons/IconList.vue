<script setup lang="ts">
import { computed, ref } from 'vue'
import Search from '@oneonefour/rkui/components/search/Search.vue'

const modules = import.meta.glob('../../../../dist/icons/*.vue', { eager: true }) as Record<
  string,
  { default: object }
>

const icons = Object.entries(modules).map(([path, module]) => ({
  name: path.slice(path.lastIndexOf('/') + 1, -'.vue'.length),
  component: module.default,
}))

const query = ref('')
const shown = computed(() => {
  const words = query.value.trim().toLowerCase()
  return icons.filter((icon) => icon.name.includes(words))
})
</script>

<template>
  <Search v-model="query" label="Find an icon" placeholder="Search by name" />
  <p class="icon-count" role="status">{{ shown.length }} of {{ icons.length }} icons</p>
  <ul class="icon-list">
    <li v-for="icon in shown" :key="icon.name">
      <div class="icon-pair">
        <span class="icon-panel" style="color-scheme: light">
          <component :is="icon.component" class="rkui-icon" />
        </span>
        <span class="icon-panel" style="color-scheme: dark">
          <component :is="icon.component" class="rkui-icon" />
        </span>
      </div>
      <code>{{ icon.name }}</code>
    </li>
  </ul>
</template>

<style scoped>
.icon-count {
  margin: 0.75rem 0;
  color: var(--rkui-muted);
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.icon-list li {
  display: grid;
  gap: 0.4rem;
  justify-items: center;
  min-inline-size: 0;
}

.icon-pair {
  display: flex;
  inline-size: 100%;
  border: 2px solid var(--rkui-line);
  border-radius: 0.5rem;
  overflow: hidden;
}

.icon-panel {
  display: grid;
  flex: 1;
  place-items: center;
  padding: 0.75rem 0;
  background: var(--rkui-surface);
  color: var(--rkui-fg);
}

code {
  max-inline-size: 100%;
  overflow-wrap: anywhere;
  font-size: var(--rkui-step--1);
  text-align: center;
}
</style>
