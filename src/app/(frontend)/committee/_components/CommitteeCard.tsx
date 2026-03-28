import Link from 'next/link'
import type { Committee } from '@/payload-types'

type Props = {
  committee: Committee
}

export const CommitteeCard = ({ committee }: Props) => {
  const yearLabel = committee.Year 
  const teamCount = committee.teams?.length || 0

  return (
    <article>
      <Link 
        href={`/committee/${yearLabel}`} 
        className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary hover:shadow-md hover:shadow-primary/5"
      >
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-bold tracking-tight text-card-foreground group-hover:text-primary transition-colors">
            {yearLabel}
          </span>
          
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {teamCount} {teamCount === 1 ? 'Team' : 'Teams'}
          </span>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 transition-transform duration-200" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      </Link>
    </article>
  )
}