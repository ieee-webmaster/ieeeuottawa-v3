import { Link } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SectionShell } from '@/blocks/_shared'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <SectionShell theme="default">
      <p className="mb-4 font-mono text-sm text-muted-foreground">404</p>
      <h1 className="page-title">{t('title')}</h1>
      <p className="page-intro mt-4">{t('description')}</p>
      <Link href="/" className="back-link mt-6">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        {t('action')}
      </Link>
    </SectionShell>
  )
}
