import type { File, Payload, PayloadRequest } from 'payload'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'

const lex = (text: string) =>
  ({
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [
            { type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }) as any

const mimeTypes: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

async function loadFile(relativeFromCwd: string): Promise<File> {
  const abs = path.join(process.cwd(), relativeFromCwd)
  const data = await readFile(abs)
  const name = path.basename(abs)
  return {
    name,
    data,
    mimetype: mimeTypes[path.extname(abs)] ?? 'application/octet-stream',
    size: data.byteLength,
  }
}

async function ensureMedia(payload: Payload, req: PayloadRequest, file: File, alt: string) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: file.name } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    if (!existing.docs[0].alt) {
      return payload.update({
        collection: 'media',
        id: existing.docs[0].id,
        data: { alt },
        overrideAccess: true,
        req,
      })
    }

    return existing.docs[0]
  }

  return payload.create({
    collection: 'media',
    data: { alt },
    file,
    overrideAccess: true,
    req,
  })
}

async function seedBlocksDemo() {
  const payload = await getPayload({ config })
  const req = await createLocalReq({ context: { disableRevalidate: true } }, payload)

  payload.logger.info('Seeding blocks-demo page...')

  const [
    post1File,
    post2File,
    post3File,
    hero1File,
    discordLogoFile,
    linkedInLogoFile,
    instagramLogoFile,
  ] = await Promise.all([
    loadFile('scripts/seed-blocks-images/image-post1.webp'),
    loadFile('scripts/seed-blocks-images/image-post2.webp'),
    loadFile('scripts/seed-blocks-images/image-post3.webp'),
    loadFile('scripts/seed-blocks-images/image-hero1.webp'),
    loadFile('scripts/import-legacy-content/data/social-icons/discord-light.svg'),
    loadFile('scripts/import-legacy-content/data/social-icons/linkedin-light.svg'),
    loadFile('scripts/import-legacy-content/data/social-icons/instagram-light.svg'),
  ])

  const [m1, m2, m3, mHero, discordLogo, linkedInLogo, instagramLogo] = await Promise.all([
    ensureMedia(payload, req, post1File, 'Abstract gradient - robotics chapter'),
    ensureMedia(payload, req, post2File, 'Abstract gradient - signals chapter'),
    ensureMedia(payload, req, post3File, 'Abstract gradient - computing chapter'),
    ensureMedia(payload, req, hero1File, 'Engineering at the boundary - split section'),
    ensureMedia(payload, req, discordLogoFile, 'Discord logo'),
    ensureMedia(payload, req, linkedInLogoFile, 'LinkedIn logo'),
    ensureMedia(payload, req, instagramLogoFile, 'Instagram logo'),
  ])

  await payload.delete({
    collection: 'pages',
    where: { slug: { equals: 'blocks-demo' } },
    overrideAccess: true,
    req,
  })

  const link = (label: string, url = '/en') => ({ type: 'custom' as const, label, url })

  await payload.create({
    collection: 'pages',
    data: {
      title: 'Blocks demo',
      slug: 'blocks-demo',
      _status: 'published',
      hero: {
        type: 'none',
      },
      layout: [
        {
          blockType: 'splitSection',
          theme: 'default',
          eyebrow: 'Initiative',
          title: 'Engineering at the boundary of theory and practice',
          content: lex(
            'IEEE uOttawa unites student engineers across disciplines through workshops, hackathons, and an annual technical symposium. Our chapters cover signal processing, robotics, computing, and women in engineering.',
          ),
          media: mHero.id,
          mediaPosition: 'right',
          mediaAspect: 'landscape',
          links: [
            { link: { ...link('Browse programs'), appearance: 'default' } },
            { link: { ...link('Read manifesto'), appearance: 'outline' } },
          ],
        },
        {
          blockType: 'cardGrid',
          theme: 'muted',
          eyebrow: 'Programs',
          title: 'Programs at a glance',
          description:
            'Cards exercise optional media, kicker text, descriptions, links, and responsive column classes.',
          columns: '3',
          cards: [
            {
              kicker: 'Robotics',
              title: 'Autonomous systems lab',
              description:
                'Hands-on robotics in an active research lab - design, simulate, and deploy.',
              media: m1.id,
              enableLink: true,
              link: link('Explore lab'),
            },
            {
              kicker: 'Signals',
              title: 'Signal processing seminar',
              description:
                'Weekly student-led seminars covering DSP, wireless, and communications theory.',
              media: m2.id,
              enableLink: true,
              link: link('Join seminar'),
            },
            {
              kicker: 'Computing',
              title: 'IEEE Computer Society',
              description:
                'Software, systems, and AI - workshops, project nights, and industry connections.',
              media: m3.id,
              enableLink: true,
              link: link('See chapter'),
            },
          ],
        },
        {
          blockType: 'quickLinks',
          theme: 'default',
          eyebrow: 'Directory',
          title: 'Useful destinations',
          description: 'Quick links validate card-style and list-style link groups.',
          style: 'cards',
          links: [
            {
              title: 'Membership',
              description: 'Become an active member of the chapter.',
              link: link('Membership'),
            },
            {
              title: 'Events',
              description: 'Workshops, panels, and the annual symposium.',
              link: link('Events'),
            },
            {
              title: 'Contact',
              description: 'Get in touch with the executive team.',
              link: link('Contact'),
            },
          ],
        },
        {
          blockType: 'quickLinks',
          theme: 'default',
          eyebrow: 'List view',
          title: 'Useful destinations - list',
          style: 'list',
          links: [
            {
              title: 'Membership',
              description: 'Become an active member of the chapter.',
              link: link('Membership'),
            },
            {
              title: 'Events',
              description: 'Workshops, panels, and the annual symposium.',
              link: link('Events'),
            },
            {
              title: 'Contact',
              description: 'Get in touch with the executive team.',
              link: link('Contact'),
            },
          ],
        },
        {
          blockType: 'logoGrid',
          theme: 'muted',
          eyebrow: 'Network',
          title: 'Channels and partners',
          description: 'Logo grid validates SVG media and featured item descriptions.',
          style: 'grid',
          items: [
            {
              name: 'Discord',
              logo: discordLogo.id,
              enableLink: true,
              link: link('Join Discord', 'https://discord.gg/kyTRZ6Ke6J'),
            },
            {
              name: 'LinkedIn',
              logo: linkedInLogo.id,
              enableLink: true,
              link: link('Follow LinkedIn', 'https://linkedin.com/company/ieeeuottawa'),
            },
            {
              name: 'Instagram',
              logo: instagramLogo.id,
              enableLink: true,
              link: link('Follow Instagram', 'https://instagram.com/ieeeuottawa'),
            },
          ],
        },
        {
          blockType: 'gallery',
          theme: 'default',
          eyebrow: 'Lookbook',
          title: 'From the archives',
          description: 'Selected moments from past events, workshops, and the annual symposium.',
          layout: 'featureMix',
          items: [
            {
              media: m1.id,
              caption: 'Annual symposium - 2024',
              enableLink: true,
              link: link('View'),
            },
            { media: m2.id, caption: 'Robotics night' },
            { media: m3.id, caption: 'Workshop - embedded systems' },
            { media: m1.id, caption: 'Hackathon kickoff' },
            { media: m2.id, caption: 'WIE panel' },
          ],
        },
        {
          blockType: 'accordion',
          theme: 'muted',
          eyebrow: 'FAQ',
          title: 'Common questions',
          description: 'Answers to questions members and prospective members frequently ask.',
          items: [
            {
              question: 'Who can join IEEE uOttawa?',
              answer: lex(
                'Any registered uOttawa engineering or computer-science student is welcome to participate in events. Becoming an IEEE member unlocks chapter elections and reduced rates at international conferences.',
              ),
            },
            {
              question: 'How do I get involved as a first-year?',
              answer: lex(
                'Start by attending an open workshop or chapter night. From there, sign up for our newsletter and apply when first-year representative positions open in the fall.',
              ),
            },
            {
              question: 'Do I need IEEE membership to attend events?',
              answer: lex(
                'No - most events are open to all students. IEEE membership unlocks specific perks like grant eligibility and conference travel discounts.',
              ),
            },
          ],
        },
        {
          blockType: 'ctaBand',
          theme: 'dark',
          eyebrow: 'Get involved',
          title: 'Ready to collaborate with IEEE uOttawa?',
          description: 'Join the chapter, attend an event, or pitch a project for the next term.',
          alignment: 'left',
          links: [
            { link: { ...link('Join the chapter'), appearance: 'default' } },
            { link: { ...link('Pitch a project'), appearance: 'outline' } },
          ],
        },
      ],
    },
    overrideAccess: true,
    req,
  })

  return {
    success: true,
    url: '/en/blocks-demo',
    mediaIds: [m1.id, m2.id, m3.id, mHero.id, discordLogo.id, linkedInLogo.id, instagramLogo.id],
  }
}

try {
  const result = await seedBlocksDemo()
  console.log(JSON.stringify(result, null, 2))
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
