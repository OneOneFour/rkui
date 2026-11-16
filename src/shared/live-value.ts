// A form control's value as the browser has it when its component starts, for every form control
// with a `v-model` (inputs, textareas and selects), and a radio or checkbox's checked state. Each
// directive goes on the control before its `v-model`: the first read must come before Vue's
// v-model writes to it, which for a radio is as soon as it is created.

import { startingIndex } from './starting-option'

/** A form control that holds a value: an input, a textarea or a select. */
type ValueControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

/**
 * What each control held before Vue's `v-model` first wrote to it, when the reader or the browser
 * had changed it: its value, or a select's chosen options.
 */
const changedValues = new WeakMap<ValueControl, string | HTMLOptionElement[]>()

/**
 * The value an input's markup alone gives it, as the browser cleans it up: a colour in lower case,
 * a range's value kept within its `min`, `max` and `step`.
 */
function markupValue(input: HTMLInputElement): string {
  const fresh = document.createElement('input')
  for (const { name, value } of input.attributes) {
    if (name !== 'value') fresh.setAttribute(name, value)
  }
  // The value last, after type, min and max: in Chromium, one set before them stays clamped to
  // the defaults, 0 to 100.
  const value = input.getAttribute('value')
  if (value !== null) fresh.setAttribute('value', value)
  return fresh.value
}

/** The options a select's markup alone chooses. */
function markupOptions(select: HTMLSelectElement): HTMLOptionElement[] {
  const options = [...select.options]
  if (select.multiple) return options.filter((option) => option.defaultSelected)
  const marks = options.map((option) => ({
    selected: option.defaultSelected,
    disabled: option.disabled,
  }))
  const start = options[startingIndex(marks)]
  return start ? [start] : []
}

/** What the control holds now, if the reader or the browser changed it from its markup. */
function changedInBrowser(control: ValueControl): string | HTMLOptionElement[] | undefined {
  if (control instanceof HTMLSelectElement) {
    const chosen = [...control.selectedOptions]
    const start = markupOptions(control)
    const same = chosen.length === start.length && chosen.every((option, i) => option === start[i])
    return same ? undefined : chosen
  }
  const start = control instanceof HTMLInputElement ? markupValue(control) : control.defaultValue
  return control.value === start ? undefined : control.value
}

/** Puts back what the control held before `v-model` wrote over it. */
function restore(control: ValueControl, changed: string | HTMLOptionElement[]) {
  if (typeof changed === 'string') {
    control.value = changed
    return
  }
  // A list of options comes only from a select. Choosing one unchooses the others, unless it is
  // a multiple select.
  const select = control as HTMLSelectElement
  for (const option of select.options) {
    if (changed.includes(option)) option.selected = true
    else if (select.multiple) option.selected = false
  }
}

/**
 * A directive that keeps what the browser holds in an input, a textarea or a select over the
 * model's starting value: what was typed or chosen before the component woke up
 * (`client:visible`), or a form the browser restored on going back. A range's model also follows
 * a starting value the browser kept within its `min`, `max` and `step`. Otherwise the model stays
 * exactly as the parent gave it. `const vLiveValue = useLiveValue(model)`, then
 * `<input v-live-value v-model="model">`. It hands the value on with the event `v-model` listens
 * for, as typing would, so `v-model` casts it as usual (a number for `type="number"`).
 */
export function useLiveValue(model: { value: unknown }) {
  /** The model's starting value, which v-model writes to the control as it mounts. */
  let start = ''
  return {
    // Before v-model writes the model's value over it. A control already on the page came from
    // the server; if it differs from its markup, it was changed in the browser.
    beforeMount(control: ValueControl) {
      start = String(model.value)
      if (!control.isConnected) return
      const changed = changedInBrowser(control)
      if (changed !== undefined) changedValues.set(control, changed)
    },
    // Once the mount is over, after v-model and the parent's starting value have had their say.
    mounted(control: ValueControl) {
      queueMicrotask(() => {
        const changed = changedValues.get(control)
        if (changed !== undefined) restore(control, changed)
        // The browser changed the value v-model wrote: it is neither the starting value nor one
        // the parent has set since, during the mount.
        const clamped =
          control.type === 'range' &&
          control.value !== start &&
          control.value !== String(model.value)
        if (changed === undefined && !clamped) return
        const event = control instanceof HTMLSelectElement ? 'change' : 'input'
        control.dispatchEvent(new Event(event, { bubbles: true }))
      })
    },
  }
}

/** The radios and checkboxes changed in the browser before their component woke up: checked or not. */
const changedChecks = new WeakMap<HTMLInputElement, boolean>()

/**
 * The radios that share `input`'s name on its page, as one group, or just `input` when it is a
 * checkbox or has no name.
 */
function radioGroup(input: HTMLInputElement): HTMLInputElement[] {
  if (input.type !== 'radio' || !input.name) return [input]
  const root = input.getRootNode() as Document | ShadowRoot
  return [...root.querySelectorAll<HTMLInputElement>(`input[type="radio"]`)].filter(
    (radio) => radio.name === input.name,
  )
}

/**
 * A directive that keeps a radio's or checkbox's checked state from the browser: what was clicked
 * before the component woke up (`client:visible`), or a form the browser restored on going back.
 * Write `v-live-checked` on the input before its `v-model`. It hands the state to the `v-model` with a `change` event, so
 * any model works: a radio group's value, a checkbox's boolean, a list of values.
 */
export const vLiveChecked = {
  // Before any v-model in the group writes to it. A whole radio group is read at once, since the
  // first radio's v-model unchecks the one the reader chose.
  created(input: HTMLInputElement) {
    if (!input.isConnected) return
    for (const box of radioGroup(input)) {
      if (box.checked !== box.defaultChecked && !changedChecks.has(box)) {
        changedChecks.set(box, box.checked)
      }
    }
  },
  // Once the mount is over, after v-model has its list and the parent its starting value.
  mounted(input: HTMLInputElement) {
    const checked = changedChecks.get(input)
    if (checked === undefined) return
    queueMicrotask(() => {
      input.checked = checked
      // An unchecked radio says nothing: the radio checked in its place tells the model.
      if (checked || input.type === 'checkbox') {
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
  },
}
