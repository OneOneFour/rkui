<!--
  A short plain-text tooltip over a control, shown while the control is hovered or focused, with no
  JavaScript. The slot is the control, which must point at the bubble with `aria-describedby` set
  to this `id`. Anything interactive belongs in a `Popup`. `class`, `style` and other attributes
  go on the outer span. With `tooltip-enhance.js` (in `@oneonefour/rkui/enhance.js`), Escape hides
  an open tooltip until the pointer or focus leaves it and comes back.

  @example
  <Tooltip id="save-tip" text="Save the file">
    <Button aria-describedby="save-tip">Save</Button>
  </Tooltip>
-->
<script setup lang="ts">
interface Props {
  /** The bubble's id, which the control's `aria-describedby` names. */
  id: string
  /** The tooltip's text. */
  text: string
  /** 'flat' for a bubble in the page's colours swapped, with no outline or shadow; 'toon' when left out. */
  variant?: 'toon' | 'flat'
}

const { id, text, variant = 'toon' } = defineProps<Props>()
</script>

<template>
  <span :class="['rkui-tooltip', { 'rkui-tooltip--flat': variant === 'flat' }]">
    <slot />
    <span :id class="rkui-tooltip-bubble" role="tooltip">{{ text }}</span>
  </span>
</template>
