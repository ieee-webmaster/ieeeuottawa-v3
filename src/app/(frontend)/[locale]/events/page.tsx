import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getTranslations } from 'next-intl/server'
import type { Event, Config } from '@/payload-types'
import { Eyebrow, SectionShell } from '@/blocks/_shared'
import { EventCard } from './_components/EventCard'

type Args = {
  params: Promise<{ locale: Config['locale'] }>
}

export default async function EventsPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations({ locale, namespace: 'events' })

  const { docs } = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 100,
    locale,
    overrideAccess: false,
    sort: 'date',
  })

  const now = new Date()

  const upcoming: Event[] = []
  const past: Event[] = []

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
    <>
      <SectionShell theme="default" padding="pt-24 pb-12 md:pt-36 md:pb-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="space-y-6 lg:col-span-9">
            <Eyebrow theme="default">{t('title')}</Eyebrow>
            <h1 className="text-balance text-5xl font-medium leading-[1] tracking-tight sm:text-6xl md:text-7xl">
              {t('title')}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('description')}
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell theme="default" padding="py-12 md:py-16">
        <header className="mb-8 grid gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow theme="default">{t('upcoming')}</Eyebrow>
            <h2 className="mt-4 text-3xl font-medium leading-[1.1] tracking-tight md:text-4xl">
              {t('upcoming')}
            </h2>
          </div>
          <div className="md:col-span-5 md:text-right">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-foreground/55">
              {t('eventCount', { count: upcoming.length })}
            </span>
          </div>
        </header>

        <div className="h-px w-full bg-foreground/15" />

        {upcoming.length === 0 ? (
          <p className="pt-10 text-base leading-relaxed text-muted-foreground">
            {t('noUpcoming')}
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-14 pt-10 md:grid-cols-2 lg:grid-cols-3 md:pt-14">
            {upcoming.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                locale={locale}
                index={index}
                total={upcoming.length}
              />
            ))}
          </div>
        )}
      </SectionShell>

      <SectionShell theme="muted" padding="py-12 md:py-20">
        <header className="mb-8 grid gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow theme="muted">{t('past')}</Eyebrow>
            <h2 className="mt-4 text-3xl font-medium leading-[1.1] tracking-tight md:text-4xl">
              {t('past')}
            </h2>
          </div>
          <div className="md:col-span-5 md:text-right">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-foreground/55">
              {t('eventCount', { count: past.length })}
            </span>
          </div>
        </header>

        <div className="h-px w-full bg-foreground/15" />

        {past.length === 0 ? (
          <p className="pt-10 text-base leading-relaxed text-muted-foreground">{t('noPast')}</p>
        ) : (
          <div className="grid gap-x-8 gap-y-14 pt-10 md:grid-cols-2 lg:grid-cols-3 md:pt-14">
            {past.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                locale={locale}
                index={index}
                total={past.length}
              />
            ))}
          </div>
        )}
      </SectionShell>
    </>
  )
}
