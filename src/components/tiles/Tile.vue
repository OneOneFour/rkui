<!--
  One round tile: a native radio or checkbox in a label. The slot is its number or letter, or, with
  an icon or a `hue`, hidden text that names the tile; the `icon` slot (`slot="icon"` in Astro,
  `<template #icon>` in Vue) holds the icon. Put tiles in Tiles, which fills in their `name` and
  input type. `class` and `style` go on the label; other attributes go on the input.

  @example
  <Tile value="a" checked>A</Tile>
-->
<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue'
import { hueVars, type HueOrHex } from '../../shared/hues'
import { vLiveChecked } from '../../shared/live-value'
import { NAME_PLACEHOLDER } from '../../shared/option-group'
import { OPTION_GROUP, useOptionModel } from '../../shared/option-slot'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The value the form sends when this tile is chosen. */
  value: string
  /** The input's name; its group's name when left out. */
  name?: string
  /** Starts chosen; unchosen when left out. */
  checked?: boolean
  /** Can't be chosen; enabled when left out. */
  disabled?: boolean
  /** Fill the tile with this hue or hex code, as a colour tile; an ordinary tile when left out. */
  hue?: HueOrHex
  /**
   * 'checkbox' or 'radio', for a tile on its own; its group's type, or a checkbox on its own, when
   * left out.
   */
  type?: 'checkbox' | 'radio'
  /** 'span' when the tile sits inside another label (BallotOption); 'label' when left out. */
  tag?: 'label' | 'span'
}

const {
  value,
  name,
  checked,
  disabled,
  hue,
  type = 'checkbox',
  tag = 'label',
} = defineProps<Props>()

// Inside a Vue tree the group's name and input type arrive by inject. Rendered by Astro on its
// own, the tile writes a placeholder name on a checkbox, and the group around it fills in its own
// name and type (option-group.ts).
const group = inject(OPTION_GROUP, null)
const inputType = computed(() => (group ? (group.value.multiple ? 'checkbox' : 'radio') : type))
// Its checked state: its group's model in a Vue tree (a Tiles' or a Ballot's), otherwise
// `checked`.
const selection = useOptionModel(group, { type: inputType.value, value, checked })
const attrs = useAttrs()

/** The colour tile's fill and text colour as custom properties, when `hue` is set. */
const vars = computed(() => hueVars(hue, { fill: '--rkui-swatch', text: '--rkui-swatch-on' }))

/** The page's attributes: `class` and `style` for the label (`outer`), the rest for the input. */
function pageAttrs() {
  return splitAttrs(attrs)
}
</script>

<template>
  <component
    :is="tag"
    :class="['rkui-tile', { 'rkui-tile--color': hue }]"
    :style="vars"
    v-bind="pageAttrs().outer"
  >
    <input
      v-live-checked
      v-model="selection"
      :type="inputType"
      :name="name ?? group?.name ?? NAME_PLACEHOLDER"
      :value
      :disabled
      v-bind="pageAttrs().inner"
    />
    <slot name="icon" />
    <span v-if="$slots.default && (hue || $slots.icon)" class="rkui-visually-hidden">
      <slot />
    </span>
    <slot v-else />
  </component>
</template>
