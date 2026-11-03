/** What an option renders as its input's `name` when the page gives it none. */
export const NAME_PLACEHOLDER = 'rkui-option-name'

/**
 * Fills a group's `name` (and radio or checkbox type) into the options it has rendered, so the page
 * writes them once. An option with no `name` of its own renders `NAME_PLACEHOLDER`, and an input
 * with that name is a checkbox until the group says otherwise. An option given its own `name` is
 * left as it is.
 */
export function fillOptions(html: string, name: string, multiple: boolean): string {
  const type = multiple ? 'checkbox' : 'radio'
  const safeName = name.replaceAll('"', '&quot;')
  return html
    .replaceAll(
      `type="checkbox" name="${NAME_PLACEHOLDER}"`,
      () => `type="${type}" name="${safeName}"`,
    )
    .replaceAll(`name="${NAME_PLACEHOLDER}"`, () => `name="${safeName}"`)
}
