// A form control's value as the browser has it when its component starts, for the interactive
// form controls (Stepper, Clock, Dial, Range), and a radio or checkbox's checked state. Each
// directive goes on the input before its `v-model`: the first read must come before Vue's v-model
// writes to the input, which for a radio is as soon as it is created.

/** A component's model: the `ref` that `defineModel()` returns. */
interface Model<T> {
  value: T
}

/** The value each input had before Vue's `v-model` first wrote to it, when it was changed. */
const changedValues = new WeakMap<HTMLInputElement, string>()

/**
 * A directive that makes the input's value in the browser win over the model's starting value:
 * `const vLiveValue = useLiveValue(model, (input) => input.valueAsNumber)`, then
 * `<input v-live-value v-model="model">`. It covers what was typed before
 * the component woke up (`client:visible`), a form the browser restored on going back, and a
 * starting value the browser clamped or snapped to the input's `min`, `max` and `step`.
 * `read` gives the input's value as the model holds it.
 */
export function useLiveValue<T>(model: Model<T>, read: (input: HTMLInputElement) => T) {
  return {
    // Before v-model writes the model's value over it. An input already on the page came from the
    // server; if its value differs from its `value` attribute, it was changed in the browser.
    beforeMount(input: HTMLInputElement) {
      if (input.isConnected && input.value !== input.defaultValue) {
        changedValues.set(input, input.value)
      }
    },
    // Once the mount is over, after v-model and the parent's starting value have had their say.
    mounted(input: HTMLInputElement) {
      queueMicrotask(() => {
        const changed = changedValues.get(input)
        if (changed !== undefined) input.value = changed
        const value = read(input)
        if (value !== model.value) model.value = value
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
