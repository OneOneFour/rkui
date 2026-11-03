/** The props every control shares for its Field's message. */
interface FieldProps {
  hint?: string
  error?: string
}

/** The attributes a page may already have set that a Field also writes. */
interface LinkedAttrs {
  'aria-describedby'?: string | null
  'aria-invalid'?: string | boolean | null
}

/**
 * Returns the control's attributes with its `id` and the link to its Field's message: the message's
 * id (`${id}-message`) is joined onto any `aria-describedby` the page set, and `aria-invalid` is
 * `true` while there is an error.
 */
export function fieldAttrs<T extends LinkedAttrs>(
  id: string,
  { hint, error }: FieldProps,
  attrs: T,
) {
  const message = hint || error ? `${id}-message` : undefined
  const describedby = [attrs['aria-describedby'], message].filter(Boolean).join(' ')
  return {
    ...attrs,
    id,
    'aria-describedby': describedby || undefined,
    // `as const` keeps the literal type the HTML attribute types ask for.
    'aria-invalid': error ? ('true' as const) : attrs['aria-invalid'],
  }
}
