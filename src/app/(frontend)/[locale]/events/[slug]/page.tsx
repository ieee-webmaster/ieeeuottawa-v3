import { formatEventLocation } from '@/utilities/formatEventLocation'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { LinkButton } from '../_components/LinkButton'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { SectionShell } from '@/blocks/_shared'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { getTranslations } from 'next-intl/server'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import type { Config } from '@/payload-types'
import RichText from '@/components/RichText'
import { Media as PayloadMedia } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { ArrowLeft } from 'lucide-react'
import { getCachedEventBySlug, getEventBySlug, getPublishedEventSlugs } from '@/utilities/publicCms'

export const revalidate = 3600

export async function generateStaticParams() {
  return getPublishedEventSlugs()
}

type Args = {
  params: Promise<{
    locale: Config['locale']
    slug?: string
  }>
}

export default async function EventPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = '' } = await paramsPromise
  const url = `/events/${encodeURIComponent(slug)}`
  const event = await queryEventBySlug({ slug, locale })
  const t = await getTranslations({ locale, namespace: 'events' })

  if (!event) {
    return <PayloadRedirects url={url} />
  }

  const eventDate = event.date ? new Date(event.date) : null
  const isPastEvent =
    eventDate !== null && !Number.isNaN(eventDate.valueOf()) && eventDate < new Date()
  const hostedBy = event['hosted-by']?.filter((item) => typeof item !== 'number') ?? []
  const hostedByLabel =
    hostedBy.length > 0 ? hostedBy.map((team) => team.name).join(', ') : 'IEEE uOttawa'
  const eventContentLength = event.content
    ? convertLexicalToPlaintext({ data: event.content }).length
    : 0

  return (
    <article>
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <SectionShell theme="default">
        <Link href="/events" className="back-link mb-4">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t('backToEvents')}
        </Link>
        <header className="mb-8 space-y-3">
          {isPastEvent && <p className="font-mono text-xs text-muted-foreground">{t('past')}</p>}
          <h1 className="page-title max-w-4xl">{event.title}</h1>
        </header>
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div>
            <dl className="grid gap-x-8 gap-y-5 border-y border-border py-6 sm:grid-cols-2">
              {event.date && (
                <div className="space-y-1">
                  <dt className="font-mono text-xs text-muted-foreground">{t('date')}</dt>
                  <dd>
                    <time dateTime={event.date}>{formatDateTime(event.date, locale)}</time>
                  </dd>
                </div>
              )}
              {event.location && (
                <div className="space-y-1">
                  <dt className="font-mono text-xs text-muted-foreground">{t('location')}</dt>
                  <dd className="break-words text-base leading-relaxed">
                    {formatEventLocation(event.location)}
                  </dd>
                </div>
              )}
              <div className="space-y-1">
                <dt className="font-mono text-xs text-muted-foreground">{t('hostedBy')}</dt>
                <dd>{hostedByLabel}</dd>
              </div>
            </dl>
            {((!isPastEvent && event.SignupLink) || (isPastEvent && event.MediaLink)) && (
              <div className="mt-6">
                {!isPastEvent && event.SignupLink && (
                  <LinkButton href={event.SignupLink} innerText={t('signUp')} />
                )}
                {isPastEvent && event.MediaLink && (
                  <LinkButton href={event.MediaLink} innerText={t('viewMedia')} />
                )}
              </div>
            )}
            {event.content && (
              <RichText className="mt-8 max-w-prose" data={event.content} enableGutter={false} />
            )}
            {!isPastEvent && event.SignupLink && eventContentLength > 1000 && (
              <div className="mt-8">
                <LinkButton href={event.SignupLink} innerText={t('signUp')} />
              </div>
            )}
          </div>
          {event.heroImage && typeof event.heroImage !== 'number' && (
            <PayloadMedia
              priority
              resource={event.heroImage}
              alt={event.heroImage.alt || event.title}
              imgClassName="block h-auto w-full"
              pictureClassName="block"
              sizesPreset="half"
            />
          )}
        </div>
      </SectionShell>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = '' } = await paramsPromise
  const event = await queryEventBySlug({ slug, locale })

  return generateMeta({ collection: 'events', doc: event, locale })
}

const queryEventBySlug = cache(
  async ({ slug, locale }: { slug: string; locale: Config['locale'] }) => {
    const { isEnabled: draft } = await draftMode()

    if (draft) {
      return getEventBySlug({ draft, locale, slug })
    }

    return getCachedEventBySlug(slug, locale)
  },
)
