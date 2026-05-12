import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Config } from '@/payload-types'
import {
  Eyebrow,
  IndexNumber,
  SectionShell,
  themeMutedText,
  themeRule,
  type BlockTheme,
} from '@/blocks/_shared'
import { cn } from '@/utilities/ui'

type Args = {
  params: Promise<{ locale: Config['locale'] }>
}

export default async function DocumentsPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'docs',
    depth: 0,
    sort: '-year',
    limit: 100,
  })

  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'docs',
  })

  const theme: BlockTheme = 'default'
  const total = docs.length

  return (
    <SectionShell theme={theme} padding="py-20 md:py-28">
      <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end md:gap-10">
        <div className="space-y-5 md:col-span-7">
          <Eyebrow theme={theme}>{t('archiveLabel') || 'View Archives'}</Eyebrow>
          <h1 className="text-balance text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl md:text-[3.25rem]">
            {t('title')}
          </h1>
        </div>
        <div className="md:col-span-5">
          <p className={cn('text-base leading-relaxed', themeMutedText[theme])}>
            {t('landingDescription')}
            {t('landingDescriptionCont')}
          </p>
        </div>
      </header>

      <div className={cn('h-px w-full', themeRule[theme])} />

      {docs.length === 0 ? (
        <div className={cn('py-20 text-center text-sm', themeMutedText[theme])}>{t('noYears')}</div>
      ) : (
        <ul role="list" className="divide-y divide-foreground/20">
          {docs.map((doc, index) => (
            <li
              key={doc.id}
              className="group relative focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
            >
              <Link
                href={`/documents/${doc.year}`}
                className="absolute inset-0 z-10 focus-visible:outline-none"
              >
                <span className="sr-only">{doc.year}</span>
              </Link>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-2 py-8 transition-all duration-300 group-hover:bg-foreground/[0.025] group-hover:pl-3 md:py-10">
                <IndexNumber
                  value={index + 1}
                  total={total}
                  theme={theme}
                  className="self-center"
                />
                <span className="text-balance text-4xl font-medium leading-none tracking-tight transition-colors group-hover:text-primary md:text-5xl">
                  {doc.year}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-5 w-5 self-center text-primary transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  )
}
