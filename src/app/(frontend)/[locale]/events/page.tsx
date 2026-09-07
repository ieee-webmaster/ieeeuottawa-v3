import type { Metadata } from 'next'

import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Config } from '@/payload-types'
import { SectionShell } from '@/blocks/_shared'
import { EventCard } from './_components/EventCard'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { getCachedEventList, type EventListItem } from '@/utilities/publicCms'

export const dynamic = 'force-static'
export const revalidate = 3600

type Args = {
  params: Promise<{ locale: Config['locale'] }>
}

export default async function EventsPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'events' })
  const docs = await getCachedEventList(locale)

  const now = new Date()

  const upcoming: EventListItem[] = []
  const past: EventListItem[] = []

  for (const doc of docs) {
    const eventDate = new Date(doc.date)

    if (!Number.isNaN(eventDate.valueOf()) && eventDate >= now) {
      upcoming.push(doc)
    } else {
      past.push(doc)
    }
  }

  upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <SectionShell theme="default">
      <header className="mb-10 space-y-4">
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-intro">{t('description')}</p>
        {upcoming.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('noUpcoming')}</p>
        )}
      </header>
      <div className="space-y-12 md:space-y-16">
        {upcoming.length > 0 && (
          <section>
            <header className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-4">
              <h2 className="font-display text-2xl font-medium md:text-3xl">{t('upcoming')}</h2>
              <span className="font-mono text-xs text-muted-foreground">
                {t('eventCount', { count: upcoming.length })}
              </span>
            </header>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} locale={locale} />
              ))}
            </div>
          </section>
        )}
        <section>
          <header className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-4">
            <h2 className="font-display text-2xl font-medium md:text-3xl">{t('past')}</h2>
            {past.length > 0 && (
              <span className="font-mono text-xs text-muted-foreground">
                {t('eventCount', { count: past.length })}
              </span>
            )}
          </header>
          {past.length === 0 ? (
            <p className="text-base text-muted-foreground">{t('noPast')}</p>
          ) : (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.id} event={event} locale={locale} />
              ))}
            </div>
          )}
        </section>
      </div>
    </SectionShell>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  const t = await getTranslations({ locale, namespace: 'events' })

  return generateStaticMeta({
    description: t('description'),
    locale,
    path: '/events',
    title: t('title'),
  })
}
