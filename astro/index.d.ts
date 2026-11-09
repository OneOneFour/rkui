import type { AstroIntegration } from 'astro'

export interface RkuiOptions {
  /**
   * Fenced code in MDX as CodeBlock: true, false, or the attributes every fence's CodeBlock gets,
   * such as `{ copy: 'hover', editor: true }`; true when left out.
   */
  code?: boolean | Record<string, string | boolean>
  /** `$…$` in MDX as Maths and `$$…$$` as Equation; true when left out. */
  maths?: boolean
}

/** rkui's Astro integration: fenced code and dollar maths in MDX as rkui's components. */
export default function rkui(options?: RkuiOptions): AstroIntegration
