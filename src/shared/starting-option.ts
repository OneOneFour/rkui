/** What an option's markup says about it: whether it is marked `selected`, and disabled. */
interface OptionMarks {
  selected: boolean
  disabled: boolean
}

/**
 * The option a single select starts on, as a browser picks it: the last one marked `selected`, or
 * else the first not disabled; -1 when there is none.
 */
export function startingIndex(options: OptionMarks[]): number {
  const marked = options.map((option) => option.selected).lastIndexOf(true)
  return marked !== -1 ? marked : options.findIndex((option) => !option.disabled)
}
