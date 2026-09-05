// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { Posts } from '@/collections/Posts'
import { buildCollectionFieldsEndpoint } from '@/plugins/payload-navigation/endpoints'
import { collectionFieldsResponseSchema } from '@/plugins/payload-navigation/schemas'
import { createRequest } from '../helpers/payload'

describe('automatic navigation field discovery', () => {
  it('advertises only top-level post fields, without named SEO tab duplicates', async () => {
    const { req } = await createRequest()
    const collection = req.payload.config.collections[0]
    if (!collection) throw new Error('Missing test collection')
    req.payload.config = {
      ...req.payload.config,
      collections: [{ ...collection, slug: 'posts', fields: Posts.fields }],
    }
    req.query = { slug: Posts.slug }

    const response = await buildCollectionFieldsEndpoint([Posts.slug]).handler(req)
    const { fields } = collectionFieldsResponseSchema.parse(await response.json())
    const names = fields.map(({ name }) => name)

    expect(names.filter((name) => name === 'title')).toHaveLength(1)
    expect(names).not.toContain('description')
    expect(names).toEqual(expect.arrayContaining(['publishedAt', 'generateSlug', 'slug']))
  })
})
