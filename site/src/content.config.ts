import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/**
 * The docs pages: one MDX file each in src/content/docs/. The file name is the page's address
 * (colors.mdx is /rkui/colors/, index.mdx is the home page). The sidebar lists the pages by
 * `group`, sorted by `order`.
 */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    group: z.string(),
    order: z.number(),
  }),
})

export const collections = { docs }
