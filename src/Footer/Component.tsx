import { getCachedGlobal } from '@/utilities/getGlobals'
import { resolveLocale } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Footer } from '@/payload-types'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Logo } from '@/components/Logo/Logo'
import { SocialIcons } from '@/components/SocialIcons'
import { resolveNavItems, type RawNavItem } from '@/plugins/payload-navigation'
import { resolveContentPathFromReference } from '@/routing/resolveContentPath'
import { FooterNav } from './Nav'

const currentYear = new Date().getFullYear()

export async function Footer() {
  const locale = resolveLocale(await getLocale())
  const footerData: Footer = await getCachedGlobal('footer', 2, locale)()
  const payload = await getPayload({ config: configPromise })

  const navItems = await resolveNavItems(footerData?.navItems as RawNavItem[] | null, payload, {
    locale,
    resolveLinkHref: (link) => {
      if (link.type === 'reference' && link.reference) {
        return (
          resolveContentPathFromReference(link.reference.relationTo, link.reference.value) ??
          link.url ??
          null
        )
      }
      return link.url ?? null
    },
  })

  const socialLinks = footerData?.socialLinks || []
  const contactPhone = footerData?.contactPhone
  const contactLocation = footerData?.contactLocation

  return (
    <footer className="mt-auto border-t border-primary bg-primary text-primary-foreground">
      <div className="container py-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 w-full">
          <Link className="flex items-center" href="/">
            <Logo invert />
          </Link>

          <div className="flex flex-col gap-4 md:items-end">
            <FooterNav items={navItems} />

            {socialLinks.length > 0 && (
              <SocialIcons
                links={socialLinks}
                invert
                className="flex-wrap gap-2"
                linkClassName="text-primary-foreground/90 hover:text-primary-foreground"
              />
            )}

            {(contactPhone || contactLocation) && (
              <div className="flex flex-col gap-1 text-sm text-primary-foreground/80 md:items-end">
                {contactPhone && <p>{contactPhone}</p>}
                {contactLocation && <p>{contactLocation}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <p className="text-xs opacity-70 text-center md:text-left">
            &copy; {currentYear} IEEE UOttawa. All rights reserved.
          </p>

          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
