import {
  cloneVNode,
  computed,
  ref,
  type ComputedRef,
  type InjectionKey,
  type Ref,
  type VNode,
  type WritableComputedRef,
} from 'vue'
import { fillOptions, NAME_PLACEHOLDER } from './option-group'
import { slotHtml } from './slot-html'

/** A group's selection: the chosen option's value, or the chosen values when `multiple`. */
type Selection = string | string[] | undefined

/** What a group hands its options in a Vue tree, by provide and inject. */
interface OptionGroup {
  name: string
  multiple: boolean
  /**
   * The group's `v-model`. Every group has one; the stand-in a SegmentedOption uses when no group
   * is around it (rendered by Astro on its own) leaves it out.
   */
  model?: Ref<Selection>
}

/**
 * The provide/inject key for `OptionGroup`, as a `computed`, so a change of name reaches options.
 */
export const OPTION_GROUP: InjectionKey<ComputedRef<OptionGroup>> = Symbol('rkui-option-group')

/**
 * A group's slot with its `name` filled in. Options in a Vue tree read the name by inject, so they
 * pass through as they are. Options written in MDX or .astro reach Vue already rendered, as HTML
 * (slot-html.ts), so the name is filled into that.
 */
export function fillSlot(vnodes: VNode[], group: OptionGroup): VNode[] {
  return vnodes.map((vnode) => {
    const html = slotHtml(vnode)
    if (html === undefined || !html.includes(NAME_PLACEHOLDER)) return vnode
    return cloneVNode(vnode, { value: fillOptions(html, group.name, group.multiple) })
  })
}

/**
 * The option vnodes in a slot written in a `.vue` file that are marked `checked`, through loops.
 */
function checkedOptions(vnodes: VNode[]): VNode[] {
  return vnodes.flatMap((vnode) => {
    const checked = vnode.props?.checked
    if (checked !== undefined && checked !== false) return [vnode]
    if (Array.isArray(vnode.children)) return checkedOptions(vnode.children as VNode[])
    return []
  })
}

/**
 * A group's starting value, from the options marked `checked` in its slot written in a `.vue`
 * file: all their values when `multiple`, otherwise the first one's. A slot from MDX or .astro is
 * HTML, with no options to read; there each option keeps its own `checked`.
 */
export function checkedValue(vnodes: VNode[], multiple: boolean): Selection {
  const values = checkedOptions(vnodes).map((vnode) => String(vnode.props?.value))
  return multiple ? values : values[0]
}

/** What an option tells `useOptionModel` about itself when it starts. */
interface OptionState {
  type: 'checkbox' | 'radio'
  value: string
  checked: boolean
}

/**
 * An option's state as its input reads it: a list of values for a checkbox, the value for a radio.
 */
function ownState({ type, value, checked }: OptionState): Selection {
  if (type === 'checkbox') return checked ? [value] : []
  return checked ? value : undefined
}

/**
 * What an option's input binds with `v-model`. In a group with a model it is the group's model.
 * Otherwise (an option on its own, with `group` null, or one Astro renders) it is the option's own
 * state, starting from `checked`.
 */
export function useOptionModel(
  group: ComputedRef<OptionGroup> | null,
  start: OptionState,
): WritableComputedRef<Selection> {
  const own = ref(ownState(start))
  return computed({
    get: () => (group?.value.model ? group.value.model.value : own.value),
    set(selection) {
      if (group?.value.model) group.value.model.value = selection
      else own.value = selection
    },
  })
}
