import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Config, Doc } from '@/payload-types'
import {
  Eyebrow,
  IndexNumber,
  SectionShell,
  themeKickerText,
  themeMutedText,
  themeRule,
  type BlockTheme,
} from '@/blocks/_shared'
import { cn } from '@/utilities/ui'

type DocItem = NonNullable<Doc['meetingMinutes']>[number]

const formatUrl = (url?: string) => {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

const formatDate = (dateString: string | null | undefined, locale: Config['locale']) => {
  if (!dateString) return null
  return new Intl.DateTimeFormat(locale ?? 'en', { dateStyle: 'medium' }).format(
    new Date(dateString),
  )
}

type DocumentSectionProps = {
  label: string
  items: DocItem[]
  theme: BlockTheme
  locale: Config['locale']
}

const DocumentSection = ({ label, items, theme, locale }: DocumentSectionProps) => {
  const total = items.length

  return (
    <section className="space-y-8">
      <Eyebrow theme={theme}>{label}</Eyebrow>

      <div className={cn('h-px w-full', themeRule[theme])} />

      <ul role="list" className="divide-y divide-foreground/20">
        {items.map((item, index) => (
          <li
            key={item.id || item.name}
            className="group relative focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
          >
            <a
              href={formatUrl(item.googleDocsUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-10 focus-visible:outline-none"
            >
              <span className="sr-only">{item.name}</span>
            </a>
            <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 gap-y-2 py-7 transition-all duration-300 group-hover:bg-foreground/[0.025] group-hover:pl-3">
              <IndexNumber value={index + 1} total={total} theme={theme} className="self-center" />
              <div className="space-y-1.5">
                <h3 className="text-balance text-xl font-medium leading-snug tracking-tight transition-colors group-hover:text-primary md:text-2xl">
                  {item.name}
                </h3>
                {item.meetingDate && (
                  <p
                    className={cn(
                      'font-mono text-[0.7rem] uppercase tracking-[0.22em]',
                      themeKickerText[theme],
                    )}
                  >
                    {formatDate(item.meetingDate, locale)}
                  </p>
                )}
                {item.description && (
                  <p className={cn('max-w-2xl text-sm leading-relaxed', themeMutedText[theme])}>
                    {item.description}
                  </p>
                )}
              </div>
              <ArrowUpRight
                aria-hidden="true"
                className="h-5 w-5 self-center text-primary transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export async function YearlyDocument(docs: Doc, locale: Config['locale']) {
  const theme: BlockTheme = 'default'
  const general = docs.generalDocuments ?? []
  const minutes = docs.meetingMinutes ?? []
  const other = docs.otherDocuments ?? []

  const t = await getTranslations({ locale: locale ?? 'en', namespace: 'docs' })

  const isEmpty = general.length === 0 && minutes.length === 0 && other.length === 0

  return (
    <SectionShell theme={theme} padding="py-20 md:py-24">
      <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end md:gap-10">
        <div className="space-y-5 md:col-span-7">
          <Eyebrow theme={theme}>{t('archiveEyebrow')}</Eyebrow>
          <h1 className="text-balance text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl md:text-[3rem]">
            {docs.year}
          </h1>
        </div>
        <div className="md:col-span-5 md:flex md:justify-end">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-primary transition-colors hover:text-secondary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('allYears')}
          </Link>
        </div>
      </header>

      {isEmpty ? (
        <>
          <div className={cn('h-px w-full', themeRule[theme])} />
          <div className={cn('py-20 text-center text-sm', themeMutedText[theme])}>
            {t('noDocuments')}
          </div>
        </>
      ) : (
        <div className="space-y-16 md:space-y-20">
          {general.length > 0 && (
            <DocumentSection
              label={t('generalDocuments')}
              items={general}
              theme={theme}
              locale={locale}
            />
          )}
          {minutes.length > 0 && (
            <DocumentSection
              label={t('meetingMinutes')}
              items={minutes}
              theme={theme}
              locale={locale}
            />
          )}
          {other.length > 0 && (
            <DocumentSection
              label={t('otherDocuments')}
              items={other}
              theme={theme}
              locale={locale}
            />
          )}
        </div>
      )}
    </SectionShell>
  )
}
