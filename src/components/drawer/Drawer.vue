<!--
  An rkui drawer: storage that slides out from under an edge of the element it sits in (a card, a
  panel, a plain sheet), for extra content or buttons. It is a `<details>` with its handle in the
  `<summary>`, so it needs no JavaScript and is never hydrated. It pulls out from the bottom edge,
  or the one `placement` names: put it last in its parent, or first for the top. On the left and
  right it hangs beyond the parent's side, as `overlay` does, so the parent's content stays put:
  leave room beside the parent for it. It opens as wide as its contents, up to
  `--rkui-drawer-width` (`min(12rem, 35vw)`), and a card holding one doesn't clip it; in a
  right-to-left page left and right swap. Drawers in a `Cabinet` stack as one,
  pulling out from the bottom. The slot is the drawer's contents; the `handle` slot puts an icon
  before the label (`slot="handle"` in Astro, `<template #handle>` in Vue). A drawer's pull shows
  its label; a blind's is a ring holding the caret, with the label there for screen readers,
  unless `showLabel` grows it into a pill with the label beside the caret. `class`, `style` and
  other attributes go on the `<details>`, or the `<div>` with `remote`. A card or cabinet jolts
  as a drawer slams shut in it; another parent does with the class `rkui-drawer-host`. A closed
  drawer's contents don't print. With `hue`, a drawer's tray, or a blind's screen, takes the hue's
  pale tint, and the pull, and the blind's hem, its solid fill.

  With `remote`, a button elsewhere on the page opens and shuts it, with no JavaScript: give the
  drawer an `id` and the button `popovertarget` set to it. The drawer is then a `<div>` holding an
  empty popover the button shows and hides, and the browser keeps the button's expanded state in
  step. Its front is no button: a drawer shows only an arrow, a blind's cord ends in an empty
  ring (the `handle` slot and `showLabel` do nothing), and its label names it for screen readers.
  A remote drawer starts shut, and drawers sharing a name don't close it. With its helper script
  (`drawer-enhance.js`), Escape inside it shuts it, and focus goes back to the button as it shuts.

  With `overlay`, a drawer on the top or bottom hangs over the page beyond its parent's edge
  instead of pushing the page away, as one on the left or right always does: it is placed against
  the edge of its containing block (give the parent `position: relative`) and as wide as it, or as
  tall on the left and right, and has its own fill, outline and shadow. Its parent mustn't clip it
  (no `overflow: hidden`), so on the top or bottom it suits a bar or panel rather than a card; set
  its `inset` to place it elsewhere.

  @example
  <Card title="Field notes">
    <p>Recent entries.</p>
    <Drawer label="Tools"><Button small>Export</Button></Drawer>
  </Card>
-->
<script setup lang="ts">
import { computed, inject, provide, type ComputedRef } from 'vue'
import CaretDownIcon from '@oneonefour/rkui/icons/caret-down.vue'
import { hueVars, type HueOrHex } from '../../shared/hues'

interface Props {
  /** The handle's text; with `remote`, the drawer's name for screen readers. */
  label: string
  /**
   * 'blind', a screen that unrolls from a roller; 'drawer', a drawer sunk into its parent, when
   * left out.
   */
  variant?: 'drawer' | 'blind'
  /**
   * Its colour, a palette hue or a hex code: the tray or screen takes its pale tint, the pull and
   * the blind's hem its solid fill; no colour when left out.
   */
  hue?: HueOrHex
  /** The edge of its parent it pulls out from; 'bottom' when left out. */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** Opened by a button elsewhere that names its `id`; by its own handle when left out. */
  remote?: boolean
  /**
   * On the top or bottom, hangs over what lies beyond its parent's edge instead of pushing it
   * away, with its own fill, outline and shadow; in the flow when left out. On the left and right
   * it always hangs over.
   */
  overlay?: boolean
  /**
   * The blind's pull shows the label beside its caret, as a pill. A ring with only the caret when
   * left out; a drawer's pull always shows it.
   */
  showLabel?: boolean
  /** Starts open; closed when left out. */
  open?: boolean
  /**
   * Drawers sharing a name close each other; an exclusive Cabinet's name, else independent, when
   * left out.
   */
  name?: string
  /** With `remote`, the id the opening button's `popovertarget` names; none when left out. */
  id?: string
}

const {
  label,
  variant = 'drawer',
  hue,
  placement = 'bottom',
  remote = false,
  overlay = false,
  showLabel = false,
  open = false,
  name,
  id,
} = defineProps<Props>()
// An exclusive Cabinet's name for its drawers (Cabinet.vue), or undefined.
const cabinetName = inject<ComputedRef<string | undefined> | null>('rkui-cabinet-name', null)
const groupName = computed(() => name ?? cabinetName?.value)
// A blind's pull is a pill showing the label with showLabel, else a ring that hides it. A remote
// blind's ring is empty.
const labelInPill = computed(() => variant === 'blind' && showLabel && !remote)
const labelHidden = computed(() => variant === 'blind' && !showLabel)
const classes = computed(() => [
  'rkui-drawer',
  {
    'rkui-drawer--blind': variant === 'blind',
    'rkui-drawer--hue': hue !== undefined,
    [`rkui-drawer--${placement}`]: placement !== 'bottom',
    'rkui-drawer--remote': remote,
    'rkui-drawer--overlay': overlay,
    'rkui-drawer--show-label': labelInPill.value,
  },
])
/** The tint, solid fill and its text, as custom properties, when `hue` is set. */
const vars = computed(() =>
  hueVars(hue, {
    fill: '--rkui-drawer-hue',
    text: '--rkui-drawer-on-hue',
    tint: '--rkui-drawer-tint',
    solid: true,
  }),
)
// Drawers inside this one aren't the cabinet's.
provide('rkui-cabinet-name', null)
</script>

<template>
  <div v-if="remote" :class="classes" :style="vars" role="group" :aria-label="label">
    <div :id class="rkui-drawer-switch" popover="manual"></div>
    <div class="rkui-drawer-handle" aria-hidden="true">
      <span v-if="variant === 'blind'" class="rkui-drawer-ring"></span>
      <CaretDownIcon v-else class="rkui-icon rkui-icon--small rkui-drawer-caret" />
    </div>
    <div class="rkui-drawer-tray">
      <div class="rkui-drawer-body">
        <slot />
      </div>
    </div>
  </div>
  <details v-else :id :class="classes" :style="vars" :name="groupName" :open>
    <summary class="rkui-drawer-handle">
      <span class="rkui-drawer-pull">
        <slot name="handle" />
        <span :class="['rkui-drawer-label', { 'rkui-visually-hidden': labelHidden }]">{{
          label
        }}</span>
        <CaretDownIcon class="rkui-icon rkui-icon--small rkui-drawer-caret" />
      </span>
    </summary>
    <div class="rkui-drawer-body">
      <slot />
    </div>
  </details>
</template>
