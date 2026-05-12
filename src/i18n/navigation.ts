import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Locale-aware navigation utilities. Import these instead of next/link / next/navigation
// so that all internal links automatically carry the current locale prefix.
export const { Link, usePathname, useRouter } = createNavigation(routing)
