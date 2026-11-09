<!--
  An rkui button: a `<button>`, or an `<a>` styled as one when `href` is given. Put an icon before
  the label in the slot. `class`, `style` and other attributes go on the element (`<a>` ones for a
  link, `<button>` ones otherwise).

  With `toggle` it is a button that stays pushed in while it is on: a `<label>` styled as a button,
  holding a visually hidden checkbox, so it works with no JavaScript. Screen readers hear a
  checkbox. `class` and `style` go on the label; other attributes (name, disabled, ...) go on the
  checkbox. A toggle ignores `busy`, `water`, `href` and `type`. In a `.vue` file, `v-model` is
  whether it is on. With `v-model`, the parent's value is
  the starting value; `checked` applies only without one.

  @example
  <Button hue="teal">Save</Button>
  <Button hue="#ff8800">Custom</Button>
  <Button toggle small>Pause</Button>
-->
<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { vLiveChecked } from '../../shared/live-value'
import { hueVars, isHex, type HueOrHex } from '../../shared/hues'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /**
   * The fill: a palette hue, a hex code, or 'section' for the section's colour; yellow when left
   * out.
   */
  hue?: HueOrHex | 'section'
  /** The outline-only secondary style; filled when left out. */
  unfilled?: boolean
  /** The small size; the regular size when left out. */
  small?: boolean
  /** Where a link goes; a <button> when left out. */
  href?: string
  /**
   * Starts the button busy: `aria-busy` and `aria-disabled` (it stays focusable) and rising and
   * falling water; not busy when left out. Say what is happening in the label.
   */
  busy?: boolean
  /**
   * Includes the water without starting busy, for a script that sets `aria-busy` later; only a busy
   * button has it when left out.
   */
  water?: boolean
  /** A fixed water level from 0 to 1; rising and falling when left out. */
  level?: number
  /** A button's type; 'button' when left out. Ignored for a link. */
  type?: 'button' | 'submit' | 'reset'
  /** A button that stays pushed in while it is on, holding a checkbox; a plain button when left out. */
  toggle?: boolean
  /** With `toggle`, starts on; off when left out. */
  checked?: boolean
}

const {
  hue,
  unfilled,
  small,
  href,
  busy,
  water,
  level,
  type = 'button',
  toggle,
  checked,
} = defineProps<Props>()

/**
 * With `toggle`, whether it is on (`v-model`); `checked` when left out. The undefined default stops
 * Vue reading a missing model as false.
 */
const on = defineModel<boolean | undefined>({ default: undefined })
if (on.value === undefined) on.value = checked
const attrs = useAttrs()

/** The button's classes, for its hue, style and size. */
const classes = computed(() => [
  'rkui-button',
  hue && !isHex(hue) && `rkui-button--${hue}`,
  { 'rkui-button--unfilled': unfilled, 'rkui-button--small': small },
])

/** The custom properties that are set: a hex fill and its label, and the water level. */
const vars = computed(() => ({
  ...(isHex(hue) ? hueVars(hue, { fill: '--rkui-button-fill', text: '--rkui-button-label' }) : {}),
  ...(level === undefined ? {} : { '--rkui-water-level': level }),
}))

/**
 * The page's attributes, for a toggle: `class` and `style` for the label (`outer`), the rest for
 * the checkbox. A plain button or link takes them all.
 */
function pageAttrs() {
  return splitAttrs(attrs)
}
</script>

<template>
  <label v-if="toggle" :class="classes" :style="vars" v-bind="pageAttrs().outer">
    <input
      v-live-checked
      v-model="on"
      class="rkui-visually-hidden"
      type="checkbox"
      v-bind="pageAttrs().inner"
    />
    <slot />
  </label>
  <component
    :is="href === undefined ? 'button' : 'a'"
    v-else
    :href="href"
    :type="href === undefined ? type : undefined"
    :class="classes"
    :style="vars"
    :aria-busy="busy ? 'true' : undefined"
    :aria-disabled="busy ? 'true' : undefined"
    v-bind="attrs"
  >
    <span
      v-if="busy || water"
      :class="level === undefined ? 'rkui-water rkui-water--rise' : 'rkui-water'"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>
