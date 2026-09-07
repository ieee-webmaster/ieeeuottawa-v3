import type {
  ResolvedDropdownRow,
  ResolvedLeafLink,
  ResolvedNavItem,
} from '@/plugins/payload-navigation'

import { Link } from '@/i18n/navigation'

type FooterNavProps = {
  items: ResolvedNavItem[]
  ariaLabel: string
}

const FooterLink = ({ item }: { item: ResolvedLeafLink }) => (
  <Link
    href={item.href}
    className="text-sm text-white/80 transition-colors hover:text-white"
    {...(item.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
  >
    {item.label}
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
            <FooterLink item={entry} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export const FooterNav = ({ items, ariaLabel }: FooterNavProps) => (
  <nav className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end" aria-label={ariaLabel}>
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
