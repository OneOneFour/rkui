<!--
  A short plain-text tooltip over a control, shown while the control is hovered or focused, with no
  JavaScript. The slot is the control, which must point at the bubble with `aria-describedby` set
  to this `id`. Anything interactive belongs in a `Popup`. `class`, `style` and other attributes
  go on the outer span. With `tooltip-enhance.js` (in `@oneonefour/rkui/enhance.js`), Escape hides
  an open tooltip until the pointer or focus leaves it and comes back.

  A widget can place and show a tooltip itself, for a tip that follows a point on a chart: leave
  out the slot and `id`, position it with `style`, and bind `shown`. Escape hides it until `shown`
  next turns false and back to true.

  @example
  <Tooltip id="save-tip" text="Save the file">
    <Button aria-describedby="save-tip">Save</Button>
  </Tooltip>
-->
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

interface Props {
  /** The bubble's id, which the control's `aria-describedby` names; none when left out, for a tooltip with no control. */
  id?: string
  /** The tooltip's text. */
  text: string
  /** 'flat' for a bubble in the page's colours swapped, with no outline or shadow; 'toon' when left out. */
  variant?: 'toon' | 'flat'
  /** Shows the bubble, for a tooltip a widget places itself; shown on hover and focus only when left out. */
  shown?: boolean
}

const { id, text, variant = 'toon', shown = false } = defineProps<Props>()

/** Set by Escape while shown, and cleared once `shown` turns false. */
const dismissed = ref(false)

/** Listens for Escape only while the bubble is shown; runs in the browser only, after mount. */
watchPostEffect((onCleanup) => {
  if (!shown) {
    dismissed.value = false
    return
  }
  if (dismissed.value) return
  const dismissOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') dismissed.value = true
  }
  document.addEventListener('keydown', dismissOnEscape)
  onCleanup(() => document.removeEventListener('keydown', dismissOnEscape))
})
</script>

<template>
  <span
    :class="['rkui-tooltip', { 'rkui-tooltip--flat': variant === 'flat' }]"
    :data-rkui-shown="shown && !dismissed ? '' : undefined"
  >
    <slot />
    <span :id class="rkui-tooltip-bubble" :role="id ? 'tooltip' : undefined">{{ text }}</span>
  </span>
</template>
