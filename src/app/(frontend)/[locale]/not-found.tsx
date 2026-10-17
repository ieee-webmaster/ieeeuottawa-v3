import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import styles from './not-found.module.css'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <main className={styles.page}>
      <div className={`container ${styles.content}`}>
        <p className={styles.code} aria-hidden="true">
          404
        </p>
        <h1 className={styles.title}>
          <span className="sr-only">404 — </span>
          {t('title')}
        </h1>
        <p className={styles.description}>{t('description')}</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.home}>
            {t('action')}
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <Link href="/events" className={styles.events}>
            {t('events')}
          </Link>
        </div>
      </div>
    </main>
  )
}
