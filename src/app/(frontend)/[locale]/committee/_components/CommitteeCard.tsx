import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import type { CommitteeListItem } from '@/utilities/publicCms'

type Props = {
  committee: CommitteeListItem
}

export const CommitteeCard = ({ committee }: Props) => {
  const t = useTranslations('committee')
  const yearLabel = committee.Year
  const teamCount = committee.teams?.length || 0

  return (
    <li className="border-b border-border first:border-t sm:[&:nth-child(2)]:border-t">
      <Link
        href={`/committee/${encodeURIComponent(yearLabel)}`}
        aria-label={yearLabel}
        className="group flex items-center justify-between gap-4 py-6 transition-colors hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="font-display text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
            {yearLabel}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {t('teamCount', { count: teamCount })}
          </span>
        </div>

        <ArrowRight
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
        />
      </Link>
    </li>
  )
}
