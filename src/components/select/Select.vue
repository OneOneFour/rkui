<!--
  A select: a native `<select>` in the `.rkui-select` frame, with `<option>`s in the slot, inside a
  Field. `class` and `style` go on the Field's div when there is a label, hint or error, otherwise
  on the select; other attributes (name, required, disabled, multiple, ...) go on the select.
  Without a label, give it an `aria-label`. In a `.vue` file, `v-model` is the chosen option's
  value (a list of values with `multiple`). With `v-model`, the parent's value is the starting
  value unless it is undefined; then `selected` applies and is handed to the parent. The server's HTML doesn't show the
  model's choice, as the options come through the slot: the browser shows it once the component
  runs, and until then the options marked `selected`.

  Where the browser supports it, the open list is a raised panel in the toon look, and options can
  hold icons (`<Icon class="rkui-icon rkui-icon--small" aria-hidden="true" />` before the text);
  elsewhere it is the browser's own list. Add `showSelected` to show the chosen option's icon in
  the closed select too.

  @example
  <Select label="Size" name="size">
    <option>Small</option>
    <option>Large</option>
  </Select>
  <Select v-model="size" label="Size">…</Select>
-->
<script setup lang="ts">
import { h, useAttrs, useSlots, type VNode } from 'vue'
import Field from '../field/Field.vue'
import { useComponentId } from '../../shared/component-id'
import { useLiveValue } from '../../shared/live-value'
import { modelWithStart } from '../../shared/model-start'
import { slotText } from '../../shared/slot-html'
import { controlAttrs } from '../../shared/split-attrs'
import { startingIndex } from '../../shared/starting-option'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The visible label; none when left out. */
  label?: string
  /** A quiet line under the select; none when left out. */
  hint?: string
  /** An error line under the select; it also marks the select invalid. */
  error?: string
  /**
   * The hover cue: 'ring', 'underline' or 'none'; the background sinks to the page colour when
   * left out.
   */
  hover?: 'ring' | 'underline' | 'none'
  /**
   * Show the chosen option's content, icon and all, in the closed select, where the browser draws
   * the toon list; off when left out.
   */
  showSelected?: boolean
}

const { label, hint, error, hover, showSelected } = defineProps<Props>()

/**
 * The `<option>` vnodes in a slot written in a `.vue` file, in order, through optgroups and loops.
 */
function options(vnodes: VNode[]): VNode[] {
  return vnodes.flatMap((vnode) => {
    if (vnode.type === 'option') return [vnode]
    if (Array.isArray(vnode.children)) return options(vnode.children as VNode[])
    return []
  })
}

/**
 * An option's value: its `value`, or else its text with the spaces collapsed, as a browser reads
 * it.
 */
function optionValue(option: VNode): string {
  const value = option.props?.value
  if (value !== undefined && value !== null) return String(value)
  const { children } = option
  const text = typeof children === 'string' ? children : slotText((children ?? []) as VNode[])
  return text.trim().replace(/\s+/g, ' ')
}

/** Whether an option sets a boolean attribute (`selected`, `disabled`). */
function hasFlag(option: VNode, name: string): boolean {
  const value = option.props?.[name]
  return value !== undefined && value !== false
}

/**
 * A select's starting value, read from its options in a slot written in a `.vue` file, as a
 * browser chooses it: the values of the options marked `selected` for a multiple select, and for
 * any other the last one marked, or else the first not disabled. A slot from MDX or .astro is
 * HTML, with no options to read.
 */
function selectedValue(vnodes: VNode[], multiple: boolean): string | string[] | undefined {
  const all = options(vnodes)
  if (multiple) return all.filter((option) => hasFlag(option, 'selected')).map(optionValue)
  const marks = all.map((option) => ({
    selected: hasFlag(option, 'selected'),
    disabled: hasFlag(option, 'disabled'),
  }))
  const chosen = all[startingIndex(marks)]
  return chosen && optionValue(chosen)
}

const attrs = useAttrs()
const multiple = attrs.multiple !== undefined && attrs.multiple !== false
/**
 * The chosen option's value, or values with `multiple` (`v-model`); the `selected` ones when left
 * out.
 */
const model = defineModel<string | string[]>()
const slots = useSlots()
const selection = modelWithStart(model, () => selectedValue(slots.default?.() ?? [], multiple))
// In the browser, what was chosen before the select woke up wins.
const vLiveValue = useLiveValue(selection)
const id = (attrs.id as string | undefined) ?? useComponentId('select')

// The customizable select's button, made with h(): in a template Vue warns about a `<button>`
// inside a `<select>`, and treats `<selectedcontent>` as a component.
const SelectedButton = () => h('button', h('selectedcontent'))

/**
 * The page's attributes, split between the Field and the select. Without a frame the select is
 * the outermost element, so it takes `class` and `style` too.
 */
function pageAttrs() {
  return controlAttrs(attrs, id, { label, hint, error })
}
</script>

<template>
  <Field :label :for="id" :hint :error v-bind="pageAttrs().field">
    <select
      v-live-value
      v-model="selection"
      :class="['rkui-select', hover && `rkui-hover-${hover}`]"
      v-bind="pageAttrs().control"
    >
      <SelectedButton v-if="showSelected" />
      <slot />
    </select>
  </Field>
</template>
