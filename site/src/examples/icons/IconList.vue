<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Badge from '@oneonefour/rkui/components/badge/Badge.vue'
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

/** The line that imports an icon, e.g. `import CopyIcon from '@oneonefour/rkui/icons/copy.vue'`. */
function importLine(name: string) {
  const component = name.replace(/(^|-)(\w)/g, (_, dash, letter) => letter.toUpperCase())
  return `import ${component}Icon from '@oneonefour/rkui/icons/${name}.vue'`
}

/** The icon whose tile shows the result of the last copy, and what it says, for a moment. */
const copied = ref({ name: '', message: '' })
let resetTimer: number | undefined
onBeforeUnmount(() => clearTimeout(resetTimer))

/** What a screen reader hears after a copy; nothing at rest. */
const announcement = computed(() =>
  copied.value.message === 'Copied'
    ? `Copied the import line for ${copied.value.name}`
    : copied.value.message,
)

/** Copies an icon's import line, and says whether that worked for a moment. */
async function copyImport(name: string) {
  try {
    await navigator.clipboard.writeText(importLine(name))
    copied.value = { name, message: 'Copied' }
  } catch {
    // No clipboard (an insecure page or an old browser) or permission denied.
    copied.value = { name, message: "Couldn't copy" }
  }
  clearTimeout(resetTimer)
  resetTimer = window.setTimeout(() => (copied.value = { name: '', message: '' }), 2000)
}
</script>

<template>
  <Search v-model="query" label="Find an icon" placeholder="Search by name" />
  <p class="icon-count" role="status">{{ shown.length }} of {{ icons.length }} icons</p>
  <ul class="icon-list">
    <li v-for="icon in shown" :key="icon.name">
      <button
        type="button"
        class="icon-tile"
        :aria-label="`Copy the import line for ${icon.name}`"
        :title="importLine(icon.name)"
        @click="copyImport(icon.name)"
      >
        <span class="icon-pair">
          <span class="icon-panel" style="color-scheme: light">
            <component :is="icon.component" class="rkui-icon" />
          </span>
          <span class="icon-panel" style="color-scheme: dark">
            <component :is="icon.component" class="rkui-icon" />
          </span>
          <Badge v-if="copied.name === icon.name" class="icon-copied">{{ copied.message }}</Badge>
        </span>
        <code>{{ icon.name }}</code>
      </button>
    </li>
  </ul>
  <span class="rkui-visually-hidden" aria-live="polite">{{ announcement }}</span>
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
  min-inline-size: 0;
}

.icon-tile {
  display: grid;
  gap: 0.4rem;
  justify-items: center;
  inline-size: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.icon-pair {
  position: relative;
  display: flex;
  inline-size: 100%;
  border: var(--rkui-outline-width) solid var(--rkui-line);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: var(--rkui-shadow);
  transition:
    translate var(--rkui-duration-fast) ease,
    box-shadow var(--rkui-duration-fast) ease;
}

/* The tile pops like every clickable thing (interactive.css). */
@media (hover: hover) {
  .icon-tile:hover .icon-pair {
    box-shadow: var(--rkui-shadow-hover);
    translate: calc(-1 * var(--rkui-lift-offset-x)) calc(-1 * var(--rkui-lift-offset-y));
  }
}

.icon-tile:active .icon-pair {
  box-shadow: var(--rkui-shadow-pressed);
  translate: var(--rkui-press-offset-x) var(--rkui-press-offset-y);
}

.icon-tile:focus-visible {
  outline: none;
}

.icon-tile:focus-visible .icon-pair {
  outline: var(--rkui-focus-width) solid var(--rkui-focus);
  outline-offset: var(--rkui-focus-offset);
  box-shadow: none;
}

.icon-panel {
  display: grid;
  flex: 1;
  place-items: center;
  padding: 0.75rem 0;
  background: var(--rkui-surface);
  color: var(--rkui-fg);
}

.icon-copied {
  position: absolute;
  inset: 0;
  margin: auto;
  inline-size: fit-content;
  block-size: fit-content;
}

code {
  max-inline-size: 100%;
  overflow-wrap: anywhere;
  font-size: var(--rkui-step--1);
  text-align: center;
}
</style>
