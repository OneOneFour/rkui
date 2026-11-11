import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/**
 * The docs pages: one MDX file each in src/content/docs/. The file name is the page's address
 * (colors.mdx is /rkui/colors/, index.mdx is the home page). The sidebar lists the pages by
 * `group`, sorted by `order`. A component's page names it in `component` (e.g. 'Range'), which
 * gives the page its JavaScript chip and its row in the home page's table. `new: true` marks a page
 * with something new on the branch being built, with a "New!" badge on its sidebar link.
 */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    group: z.string(),
    order: z.number(),
    component: z.string().optional(),
    new: z.boolean().optional(),
  }),
})

export const collections = { docs }
