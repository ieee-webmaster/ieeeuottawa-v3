// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Config } from 'payload'
import { plugins } from '@/plugins'
import { SITE_NAME } from '@/utilities/siteMetadata'
import { createRequest, testConfig } from '../helpers/payload'

describe('SEO title endpoint document boundary', () => {
  it.each([
    { doc: { title: 'Robotics' }, expected: `Robotics | ${SITE_NAME}` },
    { doc: { title: '  IEEE uOttawa  ' }, expected: SITE_NAME },
    { doc: { title: { en: 'Robotics' } }, expected: SITE_NAME },
    { doc: { title: 42 }, expected: SITE_NAME },
    { doc: { title: null }, expected: SITE_NAME },
    { doc: {}, expected: SITE_NAME },
    { doc: null, expected: SITE_NAME },
  ])('returns a usable title for $doc', async ({ doc, expected }) => {
    let config: Config = { ...testConfig, collections: [] }
    for (const plugin of plugins) config = await plugin(config)
    const endpoint = config.endpoints?.find(({ path }) => path === '/plugin-seo/generate-title')
    if (!endpoint) throw new Error('Missing SEO title endpoint')
    const { req } = await createRequest()
    req.json = async () => ({ collectionSlug: 'pages', doc })
    const response = await endpoint.handler(req)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ result: expected })
  })
})
