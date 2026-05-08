import type {
  ResolvedDropdownRow,
  ResolvedLeafLink,
  ResolvedLinkRow,
  ResolvedNavItem,
} from '@/plugins/payload-navigation'

import { CMSLink } from '@/components/Link'
import { Link } from '@/i18n/navigation'

type FooterNavProps = {
  items: ResolvedNavItem[]
}

const FooterDropdownLink = ({ entry }: { entry: ResolvedLeafLink }) => (
  <Link
    href={entry.href}
    className="text-sm text-primary-foreground/85 hover:text-primary-foreground"
    {...(entry.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
  >
    {entry.label}
  </Link>
)

const FooterDropdown = ({ item }: { item: ResolvedDropdownRow }) => {
  if (item.items.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold uppercase tracking-wide opacity-90">{item.label}</span>
      <ul className="flex flex-col gap-1">
        {item.items.map((entry, index) => (
          <li key={`${entry.href}-${index}`}>
            <FooterDropdownLink entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const FooterLink = ({ item }: { item: ResolvedLinkRow }) => {
  const link = (item.link ?? {}) as Parameters<typeof CMSLink>[0]

  return <CMSLink {...link} />
}

export const FooterNav = ({ items }: FooterNavProps) => (
  <nav className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end" aria-label="Footer navigation">
    {items.map((item, index) => {
      const key = item.id ?? `${item.kind}-${index}`

      return item.kind === 'dropdown' ? (
        <FooterDropdown key={key} item={item} />
      ) : (
        <FooterLink key={key} item={item} />
      )
    })}
  </nav>
)
