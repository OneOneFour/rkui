<!--
  An urgent message in a box in the middle of the window, like a script's `alert()`: a native
  `<dialog>` opened as a modal, so the page behind it is blurred, held still and can't be used,
  focus moves into it, and focus goes back to the opening button when it closes. A band in its `hue`
  holds an icon and the title. The slot is the message; the `icon` slot replaces the band's warning
  icon; the `actions` slot holds its buttons (`slot="actions"` in Astro, or
  `<Fragment slot="actions">` around several; `<template #actions>` in Vue). `class`, `style` and
  other attributes go on the `<dialog>`.

  Needs no JavaScript. A button opens it with `command="show-modal"` and `commandfor` set to this
  `id`, and one inside closes it with `command="close"`; its `value` becomes the dialog's
  `returnValue`. A script opens it with `document.getElementById(id).showModal()`. Escape closes
  it, unless it has `closedby="none"`; `closedby="any"` also closes it on a click outside. Put
  `autofocus` on the button focus should start on, else the first one gets it. `alert-enhance.js`
  makes the buttons and `closedby="none"` work in browsers without them (Safari before 26.2).

  @example
  <Button command="show-modal" commandfor="unsaved">Leave</Button>
  <Alert id="unsaved" title="Unsaved changes">
    <p>Your changes will be lost.</p>
    <Button slot="actions" command="close" commandfor="unsaved">OK</Button>
  </Alert>
-->
<script setup lang="ts">
import { computed } from 'vue'
import WarningIcon from '@oneonefour/rkui/icons/warning.vue'
import { hueVars, type HueOrHex } from '../../shared/hues'

interface Props {
  /** The dialog's id, which the opening button's `commandfor` names. */
  id: string
  /** The title in the band, which names the dialog. */
  title: string
  /** The band's fill, a hue or a hex code; coral when left out. */
  hue?: HueOrHex
}

const { id, title, hue } = defineProps<Props>()

/** The band's fill and text as custom properties, when `hue` is set. */
const vars = computed(() =>
  hueVars(hue, { fill: '--rkui-alert-hue', text: '--rkui-alert-on-hue', solid: true }),
)
</script>

<template>
  <dialog
    :id
    class="rkui-alert"
    :style="vars"
    role="alertdialog"
    :aria-labelledby="`${id}-title`"
    :aria-describedby="`${id}-message`"
  >
    <div class="rkui-alert-band">
      <slot name="icon"><WarningIcon class="rkui-icon" /></slot>
      <h2 :id="`${id}-title`" class="rkui-alert-title">{{ title }}</h2>
    </div>
    <div :id="`${id}-message`" class="rkui-alert-message">
      <slot />
    </div>
    <div v-if="$slots.actions" class="rkui-alert-actions">
      <slot name="actions" />
    </div>
  </dialog>
</template>
