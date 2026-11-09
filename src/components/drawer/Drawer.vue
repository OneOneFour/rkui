<!--
  An rkui drawer: storage that slides out from under the bottom edge of the element it sits in (a
  card, a panel, a plain sheet), for extra content or buttons. It is a `<details>` with its handle
  in the `<summary>`, so it needs no JavaScript and is never hydrated. Put it last in its parent;
  drawers in a `Cabinet` stack as one. The slot is the drawer's contents; the `handle` slot puts
  an icon before the label (`slot="handle"` in Astro, `<template #handle>` in Vue). A drawer's
  pull shows its label; a blind's is a ring holding the caret, with the label there for screen
  readers, unless `showLabel` grows it into a pill with the label beside the caret. `class`,
  `style` and other attributes go on the `<details>`. Set `--rkui-drawer-depth` on it or any
  ancestor for a deeper or shallower tray (drawer.css); 2 when left out. A card or cabinet
  jolts as a drawer slams shut in it; another parent does with the class `rkui-drawer-host`.
  A closed drawer's contents don't print.

  @example
  <Card title="Field notes">
    <p>Recent entries.</p>
    <Drawer label="Tools"><Button small>Export</Button></Drawer>
  </Card>
-->
<script setup lang="ts">
import { computed, inject, provide, type ComputedRef } from 'vue'
import CaretDownIcon from '@oneonefour/rkui/icons/caret-down.vue'

interface Props {
  /** The handle's text. */
  label: string
  /**
   * 'blind', a screen that unrolls from a roller; 'drawer', a drawer sunk into its parent, when
   * left out.
   */
  variant?: 'drawer' | 'blind'
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
}

const { label, variant = 'drawer', showLabel = false, open = false, name } = defineProps<Props>()
// An exclusive Cabinet's name for its drawers (Cabinet.vue), or undefined.
const cabinetName = inject<ComputedRef<string | undefined> | null>('rkui-cabinet-name', null)
const groupName = computed(() => name ?? cabinetName?.value)
// A blind's pull is a pill showing the label with showLabel, else a ring that hides it.
const labelInPill = computed(() => variant === 'blind' && showLabel)
const labelHidden = computed(() => variant === 'blind' && !showLabel)
// Drawers inside this one aren't the cabinet's.
provide('rkui-cabinet-name', null)
</script>

<template>
  <details
    :class="[
      'rkui-drawer',
      { 'rkui-drawer--blind': variant === 'blind', 'rkui-drawer--show-label': labelInPill },
    ]"
    :name="groupName"
    :open
  >
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
