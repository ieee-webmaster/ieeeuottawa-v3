import type { BeforeSync } from '@payloadcms/plugin-search/types'
import type { Search } from '@/payload-types'
import { z } from 'zod'

const categorySchema = z.object({ id: z.number(), title: z.string() })
const sourcePostSchema = z.object({
  id: z.number(),
  // The search plugin also calls beforeSync for incomplete autosaved drafts.
  slug: z.string().nullish(),
  title: z.string().nullish(),
  categories: z.array(z.union([z.number(), categorySchema]).nullish()).nullish(),
  meta: z
    .object({
      title: z.string().nullish(),
      image: z.union([z.number(), z.object({ id: z.number() })]).nullish(),
      description: z.string().nullish(),
    })
    .nullish(),
})

export const beforeSyncWithSearch = (async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, meta } = sourcePostSchema.parse(originalDoc)
  const image = meta?.image
  const populatedCategories: z.infer<typeof categorySchema>[] = []

  for (const category of categories ?? []) {
    if (!category) continue

    if (typeof category === 'object') {
      populatedCategories.push(category)
      continue
    }

    const doc = await req.payload.findByID({
      collection: 'categories',
      id: category,
      disableErrors: true,
      depth: 0,
      select: { title: true },
      req,
    })

    if (doc !== null) {
      populatedCategories.push(doc)
    } else {
      console.error(
        `Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search.`,
      )
    }
  }

  return {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: typeof image === 'object' && image !== null ? image.id : image,
      description: meta?.description,
    },
    categories: populatedCategories.map((each) => ({
      relationTo: 'categories',
      categoryID: String(each.id),
      title: each.title,
    })),
  } satisfies Pick<Search, 'slug' | 'meta' | 'categories'>
}) satisfies BeforeSync
