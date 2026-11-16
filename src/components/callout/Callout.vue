<!--
  An rkui callout: a tint panel with an icon, as a note, a warning or an error. The slot is its
  text. It has `role="note"`, so it isn't announced when it appears: a page that adds one puts it
  in a live region already on the page. `class`, `style` and other attributes go on the outer
  `<div>`.

  @example
  <Callout kind="warning" title="Back up first"><p>This cannot be undone.</p></Callout>
-->
<script setup lang="ts">
import { computed } from 'vue'
import InfoIcon from '@oneonefour/rkui/icons/info.vue'
import WarningIcon from '@oneonefour/rkui/icons/warning.vue'
import XCircleIcon from '@oneonefour/rkui/icons/x-circle.vue'

interface Props {
  /** 'note', 'warning' or 'error'; 'note' when left out. */
  kind?: 'note' | 'warning' | 'error'
  /** A bold first line; none when left out. */
  title?: string
}

const { kind = 'note', title } = defineProps<Props>()

/** The kind's icon, so the kinds differ by shape as well as colour. */
const icon = computed(() => {
  if (kind === 'warning') return WarningIcon
  if (kind === 'error') return XCircleIcon
  return InfoIcon
})
</script>

<template>
  <div :class="['rkui-callout', `rkui-callout--${kind}`]" role="note">
    <component :is="icon" class="rkui-icon" />
    <div class="rkui-callout-body">
      <p v-if="title" class="rkui-callout-title">{{ title }}</p>
      <slot />
    </div>
  </div>
</template>
