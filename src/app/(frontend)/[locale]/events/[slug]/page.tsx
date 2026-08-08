import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { LinkButton } from '../_components/LinkButton'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { Eyebrow, SectionShell, themeRule } from '@/blocks/_shared'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { getTranslations } from 'next-intl/server'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import type { Config, Event } from '@/payload-types'
import RichText from '@/components/RichText'
import { Media as PayloadMedia } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { ArrowLeft } from 'lucide-react'

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
    <article>
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <SectionShell theme="default" padding="pt-20 pb-12 md:pt-28 md:pb-16">
        <Link
          href="/events"
          className="group mb-10 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-primary transition-colors hover:text-[hsl(var(--interactive))] md:mb-14"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          />
          {t('backToEvents')}
        </Link>

        <header className="grid gap-8 md:grid-cols-12 md:items-end md:gap-10">
          <div className="space-y-5 md:col-span-9">
            <div className="flex flex-wrap items-center gap-4">
              <Eyebrow theme="default">{t('label')}</Eyebrow>
              {isPastEvent ? (
                <span className="border border-foreground/20 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {t('past')}
                </span>
              ) : null}
            </div>
            <h1 className="max-w-5xl text-balance text-4xl font-medium leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {event.title}
            </h1>
          </div>
        </header>

        <div className={`my-10 h-px w-full md:my-14 ${themeRule.default}`} />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t('date')}
            </p>
            <time className="block text-base leading-relaxed" dateTime={event.date}>
              {formatDateTime(event.date, locale)}
            </time>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t('location')}
            </p>
            <p className="text-base leading-relaxed">{event.location}</p>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t('hostedBy')}
            </p>
            <p className="text-base leading-relaxed">{hostedByLabel}</p>
          </div>
          <div className="flex items-end lg:justify-end">
            {!isPastEvent && event.SignupLink ? (
              <LinkButton href={event.SignupLink} innerText={t('signUp')} />
            ) : null}
            {isPastEvent && event.MediaLink ? (
              <LinkButton href={event.MediaLink} innerText={t('viewMedia')} />
            ) : null}
          </div>
        </div>

        {event.heroImage && typeof event.heroImage !== 'string' ? (
          <div className="relative mt-12 aspect-[4/3] overflow-hidden bg-foreground/[0.04] sm:aspect-video md:mt-16 lg:aspect-[21/9]">
            <PayloadMedia
              fill
              priority
              imgClassName="object-cover"
              pictureClassName="absolute inset-0"
              resource={event.heroImage}
            />
          </div>
        ) : null}
      </SectionShell>

      <SectionShell theme="default" padding="py-12 md:py-20">
        <RichText className="mx-auto max-w-3xl" data={event.content} enableGutter={false} />
        {!isPastEvent && event.SignupLink && eventContentLength > 1000 ? (
          <div className="mx-auto mt-12 flex max-w-3xl justify-start">
            <LinkButton href={event.SignupLink} innerText={t('signUp')} />
          </div>
        ) : null}
      </SectionShell>
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
