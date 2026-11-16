// The form and link attributes an Astro page may pass to an rkui component, which hands them on
// to its native element (an input's `name`, a button's `disabled`). Astro checks a Vue component's
// tags against its props and the global HTML attributes only, so this adds these to that list.
// This adds them to every tag in Astro pages, so `<div disabled>` is no longer caught. For type
// checking only; keep it alphabetical. Each type copies Astro's own (astro-jsx.d.ts), which these
// declarations must match.
//
// An Astro project that installs rkui adds this line to its `src/env.d.ts`:
//   /// <reference types="@oneonefour/rkui/astro-attributes" />
declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    accept?: string | undefined | null
    autocomplete?: string | undefined | null
    checked?: boolean | string | undefined | null
    closedby?: 'none' | 'closerequest' | 'any' | undefined | null
    cols?: number | string | undefined | null
    // `string & {}`: any other string, while editors still suggest the named commands.
    command?:
      | 'show-modal'
      | 'close'
      | 'request-close'
      | 'show-popover'
      | 'hide-popover'
      | 'toggle-popover'
      | (string & {})
      | undefined
      | null
    commandfor?: string | undefined | null
    disabled?: boolean | string | undefined | null
    download?: string | boolean | undefined | null
    form?: string | undefined | null
    formaction?: string | undefined | null
    formenctype?: string | undefined | null
    formmethod?: string | undefined | null
    formnovalidate?: boolean | string | undefined | null
    formtarget?: string | undefined | null
    list?: string | undefined | null
    max?: number | string | undefined | null
    maxlength?: number | string | undefined | null
    min?: number | string | undefined | null
    minlength?: number | string | undefined | null
    multiple?: boolean | string | undefined | null
    name?: string | undefined | null
    open?: boolean | string | undefined | null
    pattern?: string | undefined | null
    placeholder?: string | undefined | null
    popovertarget?: string | undefined | null
    popovertargetaction?: 'hide' | 'show' | 'toggle' | undefined | null
    readonly?: boolean | string | undefined | null
    rel?: string | undefined | null
    required?: boolean | string | undefined | null
    rows?: number | string | undefined | null
    step?: number | string | undefined | null
    target?: string | undefined | null
    type?: string | undefined | null
    value?: string | string[] | number | undefined | null
    wrap?: string | undefined | null
  }
}
