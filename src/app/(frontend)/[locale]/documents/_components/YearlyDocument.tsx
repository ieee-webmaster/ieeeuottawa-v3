import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Config, Doc } from '@/payload-types'
import { SectionShell, themeMutedText, themeRule, type BlockTheme } from '@/blocks/_shared'
import { cn } from '@/utilities/ui'
import { Link } from '@/i18n/navigation'

type DocItem = NonNullable<Doc['meetingMinutes']>[number]

const formatUrl = (url?: string) => {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

const formatDate = (dateString: string, locale: Config['locale']) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(dateString))

type DocumentSectionProps = {
  label: string
  items: DocItem[]
  theme: BlockTheme
  locale: Config['locale']
}

const DocumentSection = ({ label, items, theme, locale }: DocumentSectionProps) => {
  return (
    <section>
      <h2 className="border-b border-border pb-4 font-display text-2xl font-medium">{label}</h2>
      <ul role="list" className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id || item.name}>
            <a
              href={formatUrl(item.googleDocsUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-5 transition-colors hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                item.meetingDate && 'sm:grid-cols-[8rem_1fr_auto]',
              )}
            >
              {item.meetingDate && (
                <time
                  dateTime={item.meetingDate}
                  className="col-span-2 font-mono text-xs text-muted-foreground sm:col-span-1"
                >
                  {formatDate(item.meetingDate, locale)}
                </time>
              )}
              <div className="space-y-1">
                <h3 className="font-display text-lg font-medium leading-snug">{item.name}</h3>
                {item.description && (
                  <p className={cn('max-w-2xl text-sm leading-relaxed', themeMutedText[theme])}>
                    {item.description}
                  </p>
                )}
              </div>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
            </a>
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
    <SectionShell theme={theme}>
      <header className="mb-10">
        <Link href="/documents" className="back-link mb-4">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('allYears')}
        </Link>
        <h1 className="page-title">
          {docs.year} {t('title')}
        </h1>
      </header>

      {isEmpty ? (
        <>
          <div className={cn('h-px w-full', themeRule[theme])} />
          <div className={cn('py-8 text-base', themeMutedText[theme])}>{t('noDocuments')}</div>
        </>
      ) : (
        <div className="space-y-10 md:space-y-12">
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
