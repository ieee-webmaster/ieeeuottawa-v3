import path from 'node:path'

import type { SocialLink } from '@/payload-types'
import { type Payload } from 'payload'

import { createImportContext, upsertMediaFromLocalFile } from '../helpers'

type SocialLinkData = {
  darkIconFile: string
  label: string
  lightIconFile: string
  url: string
}

const SOCIAL_LINKS: SocialLinkData[] = [
  {
    darkIconFile: 'instagram-dark.svg',
    label: 'Instagram',
    lightIconFile: 'instagram-light.svg',
    url: 'https://instagram.com/ieeeuottawa',
  },
  {
    darkIconFile: 'discord-dark.svg',
    label: 'Discord',
    lightIconFile: 'discord-light.svg',
    url: 'https://discord.gg/kyTRZ6Ke6J',
  },
  {
    darkIconFile: 'youtube-dark.svg',
    label: 'YouTube',
    lightIconFile: 'youtube-light.svg',
    url: 'https://www.youtube.com/channel/UCSv1Vna97rKa8w2ktRG8wRw/videos',
  },
  {
    darkIconFile: 'twitch-dark.svg',
    label: 'Twitch',
    lightIconFile: 'twitch-light.svg',
    url: 'https://www.twitch.tv/ieeeuottawa',
  },
  {
    darkIconFile: 'linkedin-dark.svg',
    label: 'LinkedIn',
    lightIconFile: 'linkedin-light.svg',
    url: 'https://linkedin.com/company/ieeeuottawa',
  },
]

export async function importNavbar(payload: Payload, dataDir: string) {
  console.log('navbar: importing social links and header/footer globals')

  const socialLinkIds = await importSocialLinks(payload, dataDir)

  const contactPage = (
    await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      where: { slug: { equals: 'contact' } },
    })
  ).docs[0]

  const contactNavItem = contactPage
    ? {
        link: {
          type: 'reference' as const,
          label: 'Contact',
          reference: { relationTo: 'pages' as const, value: contactPage.id },
        },
      }
    : { link: { type: 'custom' as const, label: 'Contact', url: '/contact' } }

  const headerResult = await payload.updateGlobal({
    slug: 'header',
    context: createImportContext(),
    data: {
      socialLinks: socialLinkIds,
      showSocialLinkLabels: false,
      navItems: [{ link: { type: 'custom', label: 'Posts', url: '/posts' } }, contactNavItem],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    context: createImportContext(),
    data: {
      contactPhone: '613-562-5800 ext. 6196',
      contactLocation: '800 King Edward Avenue, STE 4026',
      socialLinks: socialLinkIds,
      navItems: [],
    },
  })

  const frenchContactNavItem = contactPage
    ? {
        id: headerResult.navItems?.[1]?.id,
        link: {
          type: 'reference' as const,
          label: 'Contact',
          reference: { relationTo: 'pages' as const, value: contactPage.id },
        },
      }
    : {
        id: headerResult.navItems?.[1]?.id,
        link: { type: 'custom' as const, label: 'Contact', url: '/contact' },
      }

  await payload.updateGlobal({
    slug: 'header',
    context: createImportContext(),
    locale: 'fr',
    data: {
      navItems: [
        {
          id: headerResult.navItems?.[0]?.id,
          link: { type: 'custom', label: 'Articles', url: '/posts' },
        },
        frenchContactNavItem,
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    context: createImportContext(),
    locale: 'fr',
    data: {
      contactPhone: '613-562-5800 poste 6196',
      contactLocation: '800, avenue King Edward, bureau 4026',
    },
  })

  console.log('navbar: imported social links and updated header/footer globals')
}

async function importSocialLinks(payload: Payload, dataDir: string) {
  console.log(`socialLinks: importing ${SOCIAL_LINKS.length} social links`)
  const iconsDir = path.join(dataDir, 'social-icons')
  const ids: SocialLink['id'][] = []

  for (const social of SOCIAL_LINKS) {
    try {
      const lightIcon = await upsertMediaFromLocalFile(
        payload,
        path.join(iconsDir, social.lightIconFile),
        `${social.label} icon for light theme`,
      )
      const darkIcon = await upsertMediaFromLocalFile(
        payload,
        path.join(iconsDir, social.darkIconFile),
        `${social.label} icon for dark theme`,
      )

      const existing = (
        await payload.find({
          collection: 'socialLinks',
          limit: 1,
          pagination: false,
          where: { label: { equals: social.label } },
        })
      ).docs[0]

      const data = { darkIcon, label: social.label, lightIcon, url: social.url }
      const doc = existing
        ? await payload.update({
            collection: 'socialLinks',
            context: createImportContext(),
            data,
            id: existing.id,
          })
        : await payload.create({
            collection: 'socialLinks',
            context: createImportContext(),
            data,
          })

      ids.push(doc.id)
      console.log(`socialLinks: ${existing ? 'updated' : 'created'} ${social.label}`)
    } catch (error) {
      throw new Error(`socialLinks: failed to import ${social.label}`, { cause: error })
    }
  }

  return ids
}
