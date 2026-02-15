import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import type { Event } from '@/payload-types'
import RichText from '@/components/RichText'
import { Media as PayloadMedia } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const events = await payload.find({
    collection: 'events',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = events.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function EventPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/events/' + decodedSlug
  const event = await queryEventBySlug({ slug: decodedSlug })

  if (!event) {
    return <PayloadRedirects url={url} />
  }

  const eventDate = new Date(event.date)
  const isPastEvent = !Number.isNaN(eventDate.valueOf()) && eventDate < new Date()
  const eventMedia = Array.isArray(event.Media)
    ? event.Media.filter((item): item is NonNullable<typeof item> & { id: number } => {
        return typeof item === 'object' && item !== null && 'id' in item
      })
    : event.Media && typeof event.Media === 'object'
      ? [event.Media]
      : []

  return (
    <article className="pt-16 pb-16">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="relative -mt-[10.4rem] flex items-end">
        <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] text-white pb-8">
          <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
            <div className="uppercase text-sm mb-6">Event</div>
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{event.title}</h1>

            <div className="flex flex-col md:flex-row gap-4 md:gap-16">
              <div className="flex flex-col gap-1">
                <p className="text-sm">Date</p>
                <time dateTime={event.date}>{formatDateTime(event.date)}</time>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm">Location</p>
                <p>{event.location}</p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm">Hosted By</p>
                <p>
                  {typeof event['hosted-by'] === 'object' && event['hosted-by'] !== null
                    ? event['hosted-by'].name
                    : 'IEEE uOttawa'}
                </p>
              </div>

              {!isPastEvent && event.Link && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm">Register</p>
                  <a href={event.Link} rel="noopener noreferrer" target="_blank">
                    Sign up / Learn more
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-[80vh] select-none">
          {event.heroImage && typeof event.heroImage !== 'string' && (
            <PayloadMedia
              fill
              priority
              imgClassName="-z-10 object-cover"
              resource={event.heroImage}
            />
          )}
          <div className="absolute pointer-events-none left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" data={event.content} enableGutter={false} />

          {isPastEvent && eventMedia.length > 0 && (
            <div className="max-w-[48rem] mx-auto mt-8 flex flex-col gap-6">
              {eventMedia.map((mediaItem) => (
                <PayloadMedia key={mediaItem.id} resource={mediaItem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const event = await queryEventBySlug({ slug: decodedSlug })

  return generateMeta({ doc: event })
}

const queryEventBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (result.docs?.[0] as Event | undefined) || null
})
