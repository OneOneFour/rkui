<!--
  A three-dot spinner: a busy indicator with `role="status"`; the label is read out, not shown.
  `class`, `style` and other attributes go on the `<span>`.

  @example
  <Dots variant="squash" label="Saving…" />
-->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** What is happening, for screen readers; "Loading…" when left out. */
  label?: string
  /**
   * The motion: 'squash' (a row squashing as it bounces), 'triangle' (dots hop corner to corner) or
   * 'orbit' (dots chase round a circle); 'bounce' when left out.
   */
  variant?: 'bounce' | 'squash' | 'triangle' | 'orbit'
  /** The spinner's size as a CSS length; 2rem when left out. */
  size?: string
}

const { label = 'Loading…', variant = 'bounce', size } = defineProps<Props>()

/** The size as a custom property, when it is set. */
const vars = computed(() => (size ? { '--rkui-spinner-size': size } : {}))
</script>

<template>
  <span
    :class="[
      'rkui-spinner',
      {
        'rkui-spinner--dots': variant === 'bounce' || variant === 'squash',
        'rkui-spinner--squash': variant === 'squash',
        'rkui-spinner--triangle': variant === 'triangle',
        'rkui-spinner--orbit': variant === 'orbit',
      },
    ]"
    role="status"
    :style="vars"
  >
    <span class="rkui-spinner-dot"></span>
    <span class="rkui-spinner-dot"></span>
    <span class="rkui-spinner-dot"></span>
    <span class="rkui-visually-hidden">{{ label }}</span>
  </span>
</template>
