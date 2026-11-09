<!--
  An rkui callout: a tint panel with an icon and the slot as its text. `class`, `style` and other
  attributes go on the outer `<div>`.

  @example
  <Callout kind="warning" title="Back up first"><p>This cannot be undone.</p></Callout>
-->
<script setup lang="ts">
import InfoIcon from '@oneonefour/rkui/icons/info.vue'
import WarningIcon from '@oneonefour/rkui/icons/warning.vue'

interface Props {
  /** 'note' or 'warning'; 'note' when left out. */
  kind?: 'note' | 'warning'
  /** A bold first line; none when left out. */
  title?: string
}

const { kind = 'note', title } = defineProps<Props>()
</script>

<template>
  <div :class="['rkui-callout', `rkui-callout--${kind}`]" role="note">
    <WarningIcon v-if="kind === 'warning'" class="rkui-icon" />
    <InfoIcon v-else class="rkui-icon" />
    <div class="rkui-callout-body">
      <p v-if="title" class="rkui-callout-title">{{ title }}</p>
      <slot />
    </div>
  </div>
</template>
