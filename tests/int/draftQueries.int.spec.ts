import { describe, expectTypeOf, it } from 'vitest'
import type {
  getCachedEventBySlug,
  getCachedPageBySlug,
  getCachedPostBySlug,
  getEventBySlug,
  getPageBySlug,
  getPostBySlug,
} from '@/utilities/publicCms'

describe('draft query types', () => {
  it('keeps page drafts partial and published/cache reads complete', () => {
    type Draft = NonNullable<Awaited<ReturnType<typeof getPageBySlug<true>>>>
    type Published = NonNullable<Awaited<ReturnType<typeof getPageBySlug<false>>>>
    type Cached = NonNullable<Awaited<ReturnType<typeof getCachedPageBySlug>>>
    expectTypeOf<Draft['title']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Draft['id']>().toEqualTypeOf<number>()
    expectTypeOf<Published['title']>().toEqualTypeOf<string>()
    expectTypeOf<Cached['title']>().toEqualTypeOf<string>()
  })

  it('keeps post drafts partial and published/cache reads complete', () => {
    type Draft = NonNullable<Awaited<ReturnType<typeof getPostBySlug<true>>>>
    type Published = NonNullable<Awaited<ReturnType<typeof getPostBySlug<false>>>>
    type Cached = NonNullable<Awaited<ReturnType<typeof getCachedPostBySlug>>>
    expectTypeOf<Draft['content']>().toEqualTypeOf<Published['content'] | undefined>()
    expectTypeOf<Draft['id']>().toEqualTypeOf<number>()
    expectTypeOf<Published['title']>().toEqualTypeOf<string>()
    expectTypeOf<Cached['title']>().toEqualTypeOf<string>()
  })

  it('keeps event drafts partial and published/cache reads complete', () => {
    type Draft = NonNullable<Awaited<ReturnType<typeof getEventBySlug<true>>>>
    type Published = NonNullable<Awaited<ReturnType<typeof getEventBySlug<false>>>>
    type Cached = NonNullable<Awaited<ReturnType<typeof getCachedEventBySlug>>>
    expectTypeOf<Draft['hosted-by']>().toEqualTypeOf<Published['hosted-by'] | undefined>()
    expectTypeOf<Draft['id']>().toEqualTypeOf<number>()
    expectTypeOf<Published['title']>().toEqualTypeOf<string>()
    expectTypeOf<Cached['title']>().toEqualTypeOf<string>()
  })
})
