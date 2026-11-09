// How a component splits the attributes a page gives it (with `inheritAttrs: false`): `class` and
// `style` for its outermost element, the rest for its native control.
import { fieldAttrs } from './field-attrs'

/**
 * A component's attributes, split. `class` and `style` are left out when the page didn't set them,
 * so an element that binds no style of its own gets no `style=""`.
 */
interface SplitAttrs {
  outer: Record<string, unknown>
  inner: Record<string, unknown>
}

/** Splits `attrs` into `class` and `style` (`outer`) and everything else (`inner`). */
export function splitAttrs(attrs: Record<string, unknown>): SplitAttrs {
  const { class: className, style, ...inner } = attrs
  const outer: Record<string, unknown> = {}
  if (className !== undefined) outer.class = className
  if (style !== undefined) outer.style = style
  return { outer, inner }
}

/** A form control's label, hint and error, which decide whether its Field draws a frame. */
interface FieldText {
  label?: string
  hint?: string
  error?: string
}

/** A form control's attributes, split around its Field. */
interface ControlAttrs {
  /** For the Field: `class` and `style` when it draws a frame (a label, hint or error). */
  field: Record<string, unknown>
  /**
   * For a native control that is the outermost element when there is no frame (Input, Select):
   * its `id`, the link to the Field's message, and the rest, with `class` and `style` when there
   * is no frame.
   */
  control: Record<string, unknown>
  /** For the control's own wrapper (Stepper's div): `class` and `style` when there is no frame. */
  wrapper: Record<string, unknown>
  /** For the native control inside that wrapper: as `control`, but never `class` or `style`. */
  wrappedControl: Record<string, unknown>
}

/**
 * Splits a form control's attributes around its Field (see field-attrs.ts). `id` is the control's:
 * the page's own, or one from `useComponentId()`.
 */
export function controlAttrs(
  attrs: Record<string, unknown>,
  id: string,
  { label, hint, error }: FieldText,
): ControlAttrs {
  const { outer, inner } = splitAttrs(attrs)
  const framed = Boolean(label || hint || error)
  const wrappedControl = framed ? fieldAttrs(id, { hint, error }, inner) : { ...inner, id }
  return {
    field: framed ? outer : {},
    control: framed ? wrappedControl : { ...outer, ...wrappedControl },
    wrapper: framed ? {} : outer,
    wrappedControl,
  }
}
