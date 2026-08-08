import { ArrowUpRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { IndexNumber } from '@/blocks/_shared'
import { Link } from '@/i18n/navigation'
import type { Committee } from '@/payload-types'

type Props = {
  committee: Committee
  index: number
  total: number
}

export const CommitteeCard = ({ committee, index, total }: Props) => {
  const t = useTranslations('committee')
  const yearLabel = committee.Year
  const teamCount = committee.teams?.length || 0

  return (
    <li className="group relative focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
      <Link
        href={`/committee/${yearLabel}`}
        className="absolute inset-0 z-10 focus-visible:outline-none"
      >
        <span className="sr-only">{yearLabel}</span>
      </Link>

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-5 py-8 transition-all duration-300 group-hover:bg-foreground/[0.025] group-hover:pl-3 md:gap-x-8 md:py-10">
        <IndexNumber value={index + 1} total={total} theme="default" />

        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-balance text-3xl font-medium leading-none tracking-tight transition-colors group-hover:text-primary sm:text-4xl md:text-5xl">
            {yearLabel}
          </span>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            {t('teamCount', { count: teamCount })}
          </span>
        </div>

        <ArrowUpRight
          aria-hidden="true"
          className="h-5 w-5 text-primary transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
    </li>
  )
}
