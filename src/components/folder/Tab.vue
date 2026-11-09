<!--
  One tab of a `Folder`, directly inside it. Its slot is the tab's panel. The Folder builds the tab
  and its panel from this tab's props and slot (see tab-slot.ts), so a Tab takes no other
  attributes: `class`, `id` and the rest are dropped.

  @example
  <Tab label="Two" selected><p>Panel two.</p></Tab>
-->
<script setup lang="ts">
import { tabData } from './tab-items'

interface Props {
  /** The tab's text. */
  label: string
  /** The tab that starts selected; the group's first tab when none is. */
  selected?: boolean
}

const { label, selected } = defineProps<Props>()
</script>

<template>
  <!-- Rendered only when Astro renders a Tab by itself (in MDX or .astro), for its group to read. -->
  <component is="rkui-tab-item" :data-tab="tabData(label, selected)"><slot /></component>
</template>
