import type { StaticImageData } from 'next/image'

import ines from '../../../scripts/import-legacy-content/data/committee-portraits/ines-bouchama-linkedin.jpg'
import mohamed from '../../../scripts/import-legacy-content/data/committee-portraits/mohamed-boustta-linkedin.png'
import rory from '../../../scripts/import-legacy-content/data/committee-portraits/rory-mcculloch-linkedin.png'
import waaberi from '../../../scripts/import-legacy-content/data/committee-portraits/waaberi-ibrahim-linkedin.png'
import victoria from '../../../scripts/import-legacy-content/data/headshots/victoria-hough.jpg'

const portraits = new Map<string, StaticImageData>([
  ['/in/inesbouchama-creative-software-engineer', ines],
  ['/in/mohamed-boustta', mohamed],
  ['/in/rory-mcculloch', rory],
  ['/in/victoriahough', victoria],
  ['/in/waaberi', waaberi],
])

/** Use the committed originals for static builds without changing CMS relationships. */
export function getStaticPortrait(profile: string | null | undefined): StaticImageData | undefined {
  if (process.env.STATIC_EXPORT !== '1' || !profile) return undefined

  try {
    const url = new URL(profile)
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      !['linkedin.com', 'www.linkedin.com'].includes(url.hostname)
    )
      return undefined

    return portraits.get(url.pathname.replace(/\/+$/, '').toLowerCase())
  } catch {
    return undefined
  }
}
