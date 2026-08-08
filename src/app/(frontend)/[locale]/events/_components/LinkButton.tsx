import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

type Args = {
  href: string
  innerText: string
}

export const LinkButton = ({ href, innerText }: Args) => {
  return (
    <Link
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className="inline-flex min-h-11 items-center gap-3 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
    >
      {innerText}
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  )
}
