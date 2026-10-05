import { Link } from '@/i18n/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { buttonVariants } from '@/components/ui/button'
import styles from './not-found.module.css'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <main className={styles.page}>
      <div className={`container ${styles.layout}`}>
        <div>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            404 / {t('eyebrow')}
          </p>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.description}>{t('description')}</p>
          <div className={styles.actions}>
            <Link href="/" className={buttonVariants({ size: 'lg' })}>
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              {t('action')}
            </Link>
            <Link href="/events" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              {t('events')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className={styles.illustration} aria-hidden="true">
          <svg viewBox="0 0 600 400" fill="none" className={styles.circuit}>
            <path
              className={styles.digits}
              d="M144 88h-36L42 218v36h102v58h38V88Zm0 68v62h-32ZM302 88c-45 0-70 34-70 112s25 112 70 112 70-34 70-112-25-112-70-112Zm0 38c22 0 32 21 32 74s-10 74-32 74-32-21-32-74 10-74 32-74ZM518 88h-36l-66 130v36h102v58h38V88Zm0 68v62h-32Z"
            />
            <g className={styles.trace}>
              <path d="M0 350h104l38-38M600 50H486l-38 38M0 50h156l38 38h36M600 350H442l-38-38h-24" />
              <circle cx="230" cy="88" r="4" />
              <circle cx="380" cy="312" r="4" />
              <path d="M0 184h66l28-28h120l42 44h24m44 0h22l42 44h122l30-28h60" />
            </g>
            <g className={styles.break}>
              <circle cx="280" cy="200" r="5" />
              <circle cx="324" cy="200" r="5" />
              <path d="m297 178 8-12m-8 68 8-12" />
            </g>
          </svg>
          <p className={styles.caption}>{t('caption')}</p>
        </div>
      </div>
    </main>
  )
}
