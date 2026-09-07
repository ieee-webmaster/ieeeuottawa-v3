import type { Config, Page } from '@/payload-types'
import { richText } from './designRichText'

const copy = {
  en: {
    title: 'Power your student experience.',
    intro: 'Events, workshops, and a community of EECS students at the University of Ottawa.',
    about: 'Explore the branch',
    visit: 'Office Hours',
    sponsor: 'Supported by',
    office: 'Come by the office.',
    address: 'STE 4026 · 800 King Edward Avenue, Ottawa',
    cards: [
      [
        'Build and experiment',
        'Oscilloscopes, FPGA boards, soldering tools, and 3D printing for your next project.',
      ],
      [
        'Study together',
        'Find a quiet place to work, get help with a tricky course, or talk things through with our execs.',
      ],
      ['Borrow what you need', 'Make use of our EECS textbook collection and hardware library.'],
    ],
    social: "See what we're up to.",
    socialIntro: 'Event announcements, workshop highlights, and life around the branch.',
    socialLink: 'Follow on Instagram',
    contact: 'Have an idea?',
    contactIntro: 'Suggest an event, ask a question, or tell us what we could do better.',
    contactLink: 'Email the team',
  },
  fr: {
    title: 'Boostez votre vie étudiante.',
    intro:
      'Des événements, des ateliers et une communauté étudiante en génie électrique et en informatique à l’Université d’Ottawa.',
    about: 'Découvrez la branche',
    visit: 'Heures de bureau',
    sponsor: 'Avec le soutien de',
    office: 'Passez nous voir.',
    address: 'STE 4026 · 800, avenue King Edward, Ottawa',
    cards: [
      [
        'Créez et expérimentez',
        'Oscilloscopes, cartes FPGA, outils de soudure et impression 3D pour votre prochain projet.',
      ],
      [
        'Étudiez ensemble',
        'Trouvez un endroit calme pour travailler, posez vos questions de cours ou échangez avec notre équipe.',
      ],
      [
        'Empruntez le nécessaire',
        'Profitez de notre collection de manuels et de notre bibliothèque de matériel.',
      ],
    ],
    social: 'La vie de la branche.',
    socialIntro:
      'Annonces d’événements, moments forts des ateliers et vie quotidienne de notre communauté.',
    socialLink: 'Suivez-nous sur Instagram',
    contact: 'Une idée?',
    contactIntro: 'Proposez un événement, posez une question ou dites-nous comment nous améliorer.',
    contactLink: 'Écrivez à notre équipe',
  },
} as const

export function refineHome(page: Page, locale: Config['locale']) {
  const text = copy[locale]
  if (
    page.slug !== 'home' ||
    page.hero.type !== 'highImpact' ||
    page.layout.map((b) => b.blockType).join(',') !== 'logoGrid,cardGrid,splitSection,ctaBand'
  ) {
    throw new Error(
      'The homepage structure has changed; review the content patch before applying it.',
    )
  }
  const layout: Page['layout'] = page.layout.map((block) => {
    switch (block.blockType) {
      case 'logoGrid':
        return { ...block, title: text.sponsor, eyebrow: null, theme: 'default' }
      case 'cardGrid':
        if (block.cards.length !== text.cards.length)
          throw new Error('Unexpected office card count')
        return {
          ...block,
          title: text.office,
          description: text.address,
          eyebrow: null,
          theme: 'default',
          cards: block.cards.map((card, i) => {
            const entry = text.cards[i]
            if (!entry) throw new Error('Missing office card copy')
            return { ...card, title: entry[0], description: entry[1] }
          }),
        }
      case 'splitSection':
        return {
          ...block,
          title: text.social,
          content: richText(text.socialIntro),
          eyebrow: null,
          theme: 'muted',
          mediaAspect: 'wide',
          links: block.links?.map((item) => ({
            ...item,
            link: { ...item.link, label: text.socialLink },
          })),
        }
      case 'ctaBand':
        return {
          ...block,
          title: text.contact,
          description: text.contactIntro,
          eyebrow: null,
          theme: 'default',
          alignment: 'left',
          links: block.links?.map((item) => ({
            ...item,
            link: { ...item.link, label: text.contactLink },
          })),
        }
      default:
        return block
    }
  })
  return {
    hero: {
      ...page.hero,
      richText: richText(text.intro, text.title),
      links: page.hero.links?.map((item) => ({
        ...item,
        link: {
          ...item.link,
          label:
            item.link.url === '/about'
              ? text.about
              : item.link.url === '/mcnaughton-centre'
                ? text.visit
                : item.link.label,
        },
      })),
    },
    layout,
  }
}

export const facilities = [
  {
    file: 'printer.webp',
    mime: 'image/webp',
    en: [
      '3D printing',
      'Bring a course project or a personal idea to life with the office 3D printer.',
      '3D printer in the McNaughton Centre',
    ],
    fr: [
      'Impression 3D',
      'Donnez vie à un projet de cours ou à une idée personnelle avec l’imprimante 3D du bureau.',
      'Imprimante 3D au Centre McNaughton',
    ],
  },
  {
    file: 'study-place.png',
    mime: 'image/png',
    en: [
      'A place to study',
      'Work on your own or with a group, and ask our executives for help with your courses.',
      'Students working together in the McNaughton Centre',
    ],
    fr: [
      'Un endroit pour étudier',
      'Travaillez seul ou en groupe et demandez de l’aide à notre équipe pour vos cours.',
      'Des étudiants travaillent ensemble au Centre McNaughton',
    ],
  },
  {
    file: 'library.jpeg',
    mime: 'image/jpeg',
    en: [
      'Textbook library',
      'Borrow EECS textbooks for free, along with selected math, science, business, and elective titles.',
      'Textbook shelves and a student reading in the office',
    ],
    fr: [
      'Bibliothèque de manuels',
      'Empruntez gratuitement des manuels de génie électrique et d’informatique, ainsi que des titres de mathématiques, de sciences, de commerce et de cours au choix.',
      'Rayons de manuels et un étudiant qui lit au bureau',
    ],
  },
  {
    file: 'funzone.png',
    mime: 'image/png',
    en: [
      'Room to unwind',
      'Take a break, catch up with friends, and make yourself at home. Students from every program are welcome.',
      'Students relaxing and having fun at the office',
    ],
    fr: [
      'Un espace pour relaxer',
      'Faites une pause, retrouvez vos amis et installez-vous. Les étudiants de tous les programmes sont les bienvenus.',
      'Des étudiants se détendent et s’amusent au bureau',
    ],
  },
] as const

export function refineAbout(page: Page, locale: Config['locale']): Pick<Page, 'layout'> {
  if (
    page.layout.map((b) => b.blockType).join(',') !== 'splitSection,cardGrid,splitSection,ctaBand'
  )
    throw new Error('About layout changed; review the patch.')
  return {
    layout: page.layout.map((block) => {
      if (block.blockType === 'cardGrid') {
        if (block.cards.length !== 5) throw new Error('About facilities changed; review the patch.')
        const hardware = block.cards[4]
        return {
          ...block,
          columns: '2',
          cards: [
            ...block.cards.slice(0, 3),
            {
              ...hardware,
              title: locale === 'en' ? 'Tools and hardware' : 'Équipement et matériel',
              description:
                locale === 'en'
                  ? 'Work with FPGAs, oscilloscopes, microcontrollers, and soldering tools in our dry lab. Borrow hardware for your projects or use the 3D printer.'
                  : 'Utilisez les FPGA, oscilloscopes, microcontrôleurs et outils de soudure de notre laboratoire. Empruntez du matériel pour vos projets ou utilisez l’imprimante 3D.',
            },
          ],
        }
      }
      if (block.blockType === 'splitSection' && block.media)
        return {
          ...block,
          theme: 'default',
          links: block.links?.map((item) => ({
            ...item,
            link: {
              ...item.link,
              url: 'https://celebratewie.ca/',
              newTab: true,
              label: locale === 'en' ? 'Explore WIE' : 'Découvrez WIE',
            },
          })),
        }
      if (block.blockType === 'ctaBand')
        return {
          ...block,
          alignment: 'left',
          title: locale === 'en' ? 'Join the team.' : 'Joignez-vous à l’équipe.',
          links: block.links?.map((item) => ({
            ...item,
            link: { ...item.link, label: locale === 'en' ? 'Volunteer' : 'Devenir bénévole' },
          })),
        }
      return block
    }),
  }
}

export function refineMcNEmail(page: Page): Pick<Page, 'hero'> {
  const oldURL = 'mailto:communications@ieeeuottawa.ca'
  const url = 'mailto:mcnaughton@ieeeuottawa.ca'
  if (page.hero.links?.filter((item) => [oldURL, url].includes(item.link.url ?? '')).length !== 1)
    throw new Error('Unexpected McNaughton contact links; review the patch.')
  return {
    hero: {
      ...page.hero,
      links: page.hero.links.map((item) =>
        item.link.url === oldURL ? { ...item, link: { ...item.link, url } } : item,
      ),
    },
  }
}

export function refineMcN(
  page: Page,
  locale: Config['locale'],
  photoIDs: number[],
  sponsor: number,
): Pick<Page, 'hero' | 'layout'> {
  if (
    page.layout.map((b) => b.blockType).join(',') !==
    'ctaBand,splitSection,splitSection,splitSection,splitSection,splitSection'
  )
    throw new Error('McNaughton layout changed; review the patch.')
  const lab = page.layout[1]
  if (!lab || lab.blockType !== 'splitSection') throw new Error('Missing dry lab block')
  return {
    hero: {
      ...page.hero,
      type: 'lowImpact',
      links: page.hero.links?.map((item) =>
        item.link.url === 'mailto:communications@ieeeuottawa.ca'
          ? { ...item, link: { ...item.link, url: 'mailto:mcnaughton@ieeeuottawa.ca' } }
          : item,
      ),
      richText: richText(
        locale === 'en'
          ? 'Our office in STE 4026 is a place to build, study, and spend time together. Named after General A. George Latta McNaughton, the centre welcomes students from every program.'
          : 'Notre bureau au STE 4026 est un endroit pour créer, étudier et passer du temps ensemble. Nommé en l’honneur du général A. George Latta McNaughton, le centre accueille les étudiants de tous les programmes.',
        locale === 'en' ? 'McNaughton Centre' : 'Centre McNaughton',
      ),
    },
    layout: [
      {
        blockType: 'logoGrid',
        title: locale === 'en' ? 'Supported by' : 'Avec le soutien de',
        style: 'featured',
        theme: 'default',
        items: [
          {
            name: 'IEEE Canadian Foundation',
            logo: sponsor,
            enableLink: true,
            link: {
              type: 'custom',
              url: 'https://www.ieeecanadianfoundation.org/',
              label: 'IEEE Canadian Foundation',
              newTab: true,
            },
          },
        ],
      },
      {
        ...lab,
        theme: 'default',
        content: richText(
          locale === 'en'
            ? 'Put your technical skills into practice with FPGAs, oscilloscopes, multimeters, microcontrollers, a soldering station, and electronic components.'
            : 'Mettez vos compétences en pratique avec des FPGA, des oscilloscopes, des multimètres, des microcontrôleurs, une station de soudure et des composants électroniques.',
        ),
      },
      {
        blockType: 'cardGrid',
        blockName: 'McNaughton facilities',
        title: locale === 'en' ? 'Make yourself at home.' : 'Installez-vous.',
        columns: '2',
        theme: 'muted',
        cards: facilities.map((facility, index) => ({
          title: facility[locale][0],
          description: facility[locale][1],
          media: photoIDs[index],
          enableLink: false,
        })),
      },
    ],
  }
}
