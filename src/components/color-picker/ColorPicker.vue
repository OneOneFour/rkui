<!--
  A colour picker: a tile group of colour tiles (ColorTile), radios for one choice, with every hue
  of the palette when it has no tiles. `class`, `style` and other attributes go on the fieldset
  (`disabled` disables the whole group). In a `.vue` file, `v-model` is the chosen tile's value,
  or 'custom'. With `v-model`, the parent's value is the starting value unless it is undefined;
  then `value`, or else the first tile marked `checked`, applies and is handed to the parent.

  Without `custom` it works with no JavaScript, in any page; a plain HTML page writes its HTML.

  With `custom` it ends with a custom colour tile: a radio and a native colour input, whose colour
  is sent as `<name>-custom`. Picking a colour checks that tile, which needs the browser, so:
  - in an Astro page it needs `client:visible`, and draws every hue itself: ColorTiles written in
    an Astro page or MDX stop the build. For fewer hues, write the picker in a `.vue` file;
  - a plain HTML page writes `<rkui-color-picker custom legend="…" value="…">`, which draws every
    hue.
  Until it runs, the custom tile is chosen from the keyboard or by clicking its outline.

  @example
  <ColorPicker v-model="accent" legend="Accent" custom>
    <ColorTile value="teal" checked />
    <ColorTile value="coral" />
  </ColorPicker>
-->
<script setup lang="ts">
import { computed, provide, useSlots, type VNode } from 'vue'
import PaintBrushIcon from '@oneonefour/rkui/icons/paint-brush.vue'
import PaletteIcon from '@oneonefour/rkui/icons/palette.vue'
import ColorTile from './ColorTile.vue'
import { useComponentId } from '../../shared/component-id'
import { HUES } from '../../shared/hues'
import { vLiveChecked } from '../../shared/live-value'
import { modelWithStart } from '../../shared/model-start'
import { NAME_PLACEHOLDER } from '../../shared/option-group'
import { checkedValue, fillSlot, OPTION_GROUP } from '../../shared/option-slot'
import { slotHtml } from '../../shared/slot-html'

interface Props {
  /** The group's name; visually hidden unless `flair` is 'stroke'. */
  legend: string
  /** The radios' name, filled into every tile; a unique one is made when left out. */
  name?: string
  /**
   * The value chosen at the start: a hue, or 'custom'. Tiles written in an Astro page or MDX say
   * `checked` instead; the first tile marked `checked` when left out.
   */
  value?: string
  /** End the group with a custom colour tile; none when left out. */
  custom?: boolean
  /** Flair for the checked tile; none when left out. Open, see DECISIONS ("Colour-tile flair"). */
  flair?: 'brush' | 'drops' | 'stroke'
}

const { legend, name, value, custom, flair } = defineProps<Props>()

/** The chosen tile's value, or 'custom' (`v-model`); `value` or the `checked` tile's when left out. */
const model = defineModel<string>()
const slots = useSlots()
const selection = modelWithStart(model, () => value ?? checkedValue(slots.default?.() ?? [], false))
const generatedName = useComponentId('color-picker')
const group = computed(() => ({ name: name ?? generatedName, multiple: false, model: selection }))
provide(OPTION_GROUP, group)

/**
 * The tiles from the slot, with the group's name filled in. With `custom` they must be Vue
 * components: tiles Astro rendered as page HTML would be rebuilt when the picker wakes up.
 */
function tiles(vnodes: VNode[]): VNode[] {
  // Tiles Astro rendered carry the name placeholder that fillSlot fills in.
  const pageHtml = vnodes.some((vnode) => slotHtml(vnode)?.includes(NAME_PLACEHOLDER))
  if (custom && pageHtml) {
    throw new Error(
      'ColorPicker: with `custom`, its ColorTiles must be written in a .vue file. In an Astro or ' +
        'MDX page, leave the tiles out to show every hue.',
    )
  }
  return fillSlot(vnodes, group.value)
}
</script>

<template>
  <fieldset :class="['rkui-tiles', flair && `rkui-tiles--${flair}`]">
    <legend v-if="flair === 'stroke'">
      <PaletteIcon class="rkui-icon rkui-icon--small" />
      {{ legend }}
    </legend>
    <legend v-else class="rkui-visually-hidden">{{ legend }}</legend>
    <template v-if="$slots.default">
      <component :is="tile" v-for="(tile, i) in tiles($slots.default())" :key="i" />
    </template>
    <ColorTile v-for="hue in HUES" v-else :key="hue" :value="hue" />
    <label v-if="custom" class="rkui-tile rkui-tile--custom-color">
      <input
        v-live-checked
        v-model="selection"
        type="radio"
        :name="group.name"
        value="custom"
        aria-label="Custom colour"
      />
      <input
        type="color"
        :name="`${group.name}-custom`"
        aria-label="Choose custom colour"
        @input="selection = 'custom'"
      />
      <PaintBrushIcon />
    </label>
  </fieldset>
</template>
