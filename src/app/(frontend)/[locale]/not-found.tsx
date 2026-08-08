import { Link } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Eyebrow, SectionShell, themeRule } from '@/blocks/_shared'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <SectionShell theme="default" padding="py-24 md:py-36">
      <Eyebrow theme="default">404</Eyebrow>
      <div className="mt-8 grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <h1 className="text-balance text-5xl font-medium leading-[1] tracking-tight sm:text-6xl md:text-7xl">
            {t('title')}
          </h1>
        </div>
        <div className="space-y-6 md:col-span-4">
          <p className="text-base leading-relaxed text-muted-foreground">{t('description')}</p>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-primary transition-colors hover:text-[hsl(var(--interactive))]"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
            {t('action')}
          </Link>
        </div>
      </div>
      <div className={`mt-14 h-px w-full md:mt-20 ${themeRule.default}`} />
    </SectionShell>
  )
}
