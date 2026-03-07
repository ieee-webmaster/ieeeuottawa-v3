import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { LinkButton } from '../_components/LinkButton'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { getTranslations } from 'next-intl/server'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import type { Config } from '@/payload-types'
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
    locale: Config['locale']
    slug?: string
  }>
}

const getTextLength = (node: unknown): number => {
  if (typeof node !== 'object' || node === null) {
    return 0
  }

  if ('text' in node && typeof node.text === 'string') {
    return node.text.length
  }

  if ('children' in node && Array.isArray(node.children)) {
    return node.children.reduce((total, child) => total + getTextLength(child), 0)
  }

  return 0
}

export default async function EventPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = `/events/${encodeURIComponent(decodedSlug)}`
  const event = await queryEventBySlug({ slug: decodedSlug, locale })
  const t = await getTranslations({ locale, namespace: 'events' })

  if (!event) {
    return <PayloadRedirects url={url} />
  }

  const eventDate = new Date(event.date)
  const isPastEvent = !Number.isNaN(eventDate.valueOf()) && eventDate < new Date()
  const hostedBy = event['hosted-by'].filter(
    (item): item is NonNullable<(typeof event)['hosted-by'][number]> & { name: string } => {
      return (
        typeof item === 'object' && item !== null && 'name' in item && typeof item.name === 'string'
      )
    },
  )
  const hostedByLabel =
    hostedBy.length > 0 ? hostedBy.map((team) => team.name).join(', ') : 'IEEE uOttawa'
  const eventContentLength =
    'root' in event.content && Array.isArray(event.content.root.children)
      ? event.content.root.children.reduce((total, child) => total + getTextLength(child), 0)
      : 0

  return (
    <article className="pt-16 pb-16">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="relative -mt-[10.4rem] flex items-end">
        <Link
          href="/events"
          className="absolute top-8 left-4 z-20 flex h-10 w-10 items-center justify-center rounded bg-black/40 text-white transition-hover hover:bg-black"
          aria-label={t('backToEvents')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>

        <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] text-white pb-8">
          <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="uppercase text-sm opacity-80">{t('label')}</div>

              {isPastEvent && (
                <svg width="54" height="24" viewBox="0 0 54 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 0H52C53.1046 0 54 0.895431 54 2V22C54 23.1046 53.1046 24 52 24H8L0 12L8 0Z"
                    fill="#f8fafc"
                  />
                  <text
                    x="30"
                    y="16"
                    fill="#0f172a"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="uppercase tracking-wider"
                  >
                    {t('past')}
                  </text>
                </svg>
              )}
            </div>
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl max-w-[48rem]">{event.title}</h1>

            <div className="flex flex-col md:flex-row gap-4 md:gap-16">
              <div className="flex flex-col gap-1">
                <p className="text-sm">{t('date')}</p>
                <time dateTime={event.date}>{formatDateTime(event.date, locale)}</time>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm">{t('location')}</p>
                <p>{event.location}</p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm">{t('hostedBy')}</p>
                <p>{hostedByLabel}</p>
              </div>

              {!isPastEvent && event.SignupLink && (
                <LinkButton href={event.SignupLink} innerText={t('signUp')} />
              )}
              {isPastEvent && event.MediaLink && (
                <LinkButton href={event.MediaLink} innerText={t('viewMedia')} />
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
        </div>
      </div>

      <div className="flex justify-center mt-12">
        {!isPastEvent && event.SignupLink && eventContentLength > 1000 && (
          <LinkButton href={event.SignupLink} innerText={t('signUp')} />
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const event = await queryEventBySlug({ slug: decodedSlug, locale })

  return generateMeta({ collection: 'events', doc: event, locale })
}

const queryEventBySlug = cache(
  async ({ slug, locale }: { slug: string; locale: Config['locale'] }) => {
    const { isEnabled: draft } = await draftMode()

    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'events',
      depth: 2,
      draft,
      limit: 1,
      locale,
      overrideAccess: draft,
      pagination: false,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return (result.docs?.[0] as Event | undefined) || null
  },
)
