import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

const categories = ['Technology', 'News', 'Finance', 'Design', 'Software', 'Engineering']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database — serialize deletes to avoid PostgreSQL deadlocks
  // on related/locale tables
  for (const global of globals) {
    await payload.updateGlobal({
      slug: global,
      data: {
        navItems: [],
      },
      depth: 0,
      context: {
        disableRevalidate: true,
      },
    })
  }

  for (const collection of collections) {
    await payload.db.deleteMany({ collection, req, where: {} })
  }

  for (const collection of collections) {
    if (payload.collections[collection].config.versions) {
      await payload.db.deleteVersions({ collection, req, where: {} })
    }
  }

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })

  payload.logger.info(`— Seeding media...`)

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])

  const [demoAuthor, image1Doc, image2Doc, image3Doc, imageHomeDoc] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'Demo Author',
        email: 'demo-author@example.com',
        password: 'password',
      },
    }),
    payload.create({
      collection: 'media',
      data: image1,
      file: image1Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image2Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image3Buffer,
    }),
    payload.create({
      collection: 'media',
      data: imageHero1,
      file: hero1Buffer,
    }),
    categories.map((category) =>
      payload.create({
        collection: 'categories',
        data: {
          title: category,
          slug: category,
        },
      }),
    ),
  ])

  payload.logger.info(`— Seeding posts...`)

  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })

  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })

  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
  })

  // update each post with related posts
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id],
    },
  })

  payload.logger.info(`— Seeding contact form...`)

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
  })

  payload.logger.info(`— Seeding pages...`)

  const [homePage, contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      data: home({ heroImage: imageHomeDoc, metaImage: image2Doc }),
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({ contactForm: contactForm }),
    }),
  ])

  payload.logger.info(`— Seeding globals...`)

  const [headerResult, footerResult] = await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Posts',
              url: '/posts',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Admin',
              url: '/admin',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Source Code',
              newTab: true,
              url: 'https://github.com/payloadcms/payload/tree/main/templates/website',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Payload',
              newTab: true,
              url: 'https://payloadcms.com/',
            },
          },
        ],
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')

  payload.logger.info(`— Seeding French translations...`)

  // Seed French translations for localized fields
  // All operations are serialized to avoid PostgreSQL deadlocks on locale tables

  // Categories
  const categoryTranslations: Record<string, string> = {
    Technology: 'Technologie',
    News: 'Nouvelles',
    Finance: 'Finance',
    Design: 'Design',
    Software: 'Logiciel',
    Engineering: 'Ingénierie',
  }

  const allCategories = await payload.find({
    collection: 'categories',
    limit: 100,
    pagination: false,
  })

  for (const cat of allCategories.docs) {
    await payload.update({
      collection: 'categories',
      id: cat.id,
      locale: 'fr',
      data: {
        title: categoryTranslations[cat.title] || cat.title,
      },
      context: { disableRevalidate: true },
    })
  }

  // --- Rich text helpers for building Lexical content nodes ---
  const _text = (t: string, format = 0) =>
    ({ type: 'text' as const, detail: 0, format, mode: 'normal' as const, style: '', text: t, version: 1 })
  const _link = (t: string, url: string, newTab = false) => ({
    type: 'link' as const,
    children: [_text(t)],
    direction: 'ltr' as const,
    fields: { linkType: 'custom' as const, newTab, url },
    format: '' as const,
    indent: 0,
    version: 3,
  })
  const _p = (...children: ReturnType<typeof _text>[]) =>
    ({ type: 'paragraph' as const, children, direction: 'ltr' as const, format: '' as const, indent: 0, textFormat: 0, version: 1 })
  const _h = (tag: string, ...children: ReturnType<typeof _text>[]) =>
    ({ type: 'heading' as const, children, direction: 'ltr' as const, format: '' as const, indent: 0, tag, version: 1 })
  const _root = (...children: any[]) => ({
    root: { type: 'root' as const, children, direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 },
  })
  const _banner = (name: string, style: string, content: ReturnType<typeof _root>) => ({
    type: 'block' as const,
    fields: { blockName: name, blockType: 'banner' as const, content, style },
    format: '' as const,
    version: 2,
  })
  const _media = (mediaId: number | string) => ({
    type: 'block' as const,
    fields: { blockName: '', blockType: 'mediaBlock' as const, media: mediaId },
    format: '' as const,
    version: 2,
  })
  const _code = (name: string, language: string, code: string) => ({
    type: 'block' as const,
    fields: { blockName: name, blockType: 'code' as const, code, language },
    format: '' as const,
    version: 2,
  })

  // Reusable blocks
  const disclaimerBanner = _banner('Avertissement', 'info', _root(
    _p(
      _text('Avertissement :', 1),
      _text(' Ce contenu est fictif et à des fins de démonstration uniquement. Pour modifier cet article, '),
      _link('accédez au tableau de bord d\'administration', '/admin', true) as any,
      _text('.'),
    ),
  ))
  const dynamicBanner = _banner('Composants dynamiques', 'info', _root(
    _p(_text('Le contenu ci-dessus est entièrement dynamique grâce à des blocs de mise en page personnalisés configurés dans le CMS. Cela peut être n\'importe quoi, du texte enrichi et des images aux composants complexes et hautement conçus.')),
  ))

  // --- Post 1: Digital Horizons ---
  await payload.update({
    collection: 'posts',
    id: post1Doc.id,
    locale: 'fr',
    data: {
      title: 'Horizons numériques : un aperçu de demain',
      content: _root(
        _h('h2', _text('Plongez dans les merveilles de l\'innovation moderne, où le seul constant est le changement. Un voyage où pixels et données convergent pour façonner l\'avenir.')),
        disclaimerBanner,
        _h('h2', _text('L\'essor de l\'IA et de l\'apprentissage automatique')),
        _p(_text('Nous nous trouvons dans une ère transformatrice où l\'intelligence artificielle (IA) se trouve à l\'avant-garde de l\'évolution technologique. Les effets d\'entraînement de ses avancées refaçonnent les industries à un rythme sans précédent. Les entreprises ne sont plus limitées par les contraintes de processus manuels et fastidieux. Au contraire, des machines sophistiquées, alimentées par de vastes quantités de données historiques, sont désormais capables de prendre des décisions autrefois réservées à l\'intuition humaine. Ces systèmes intelligents ne se contentent pas d\'optimiser les opérations, ils sont aussi à l\'origine d\'approches innovantes, annonçant une nouvelle ère de transformation des entreprises à l\'échelle mondiale. ')),
        _h('h4', _text('Pour démontrer les fonctionnalités de base de l\'IA, voici un extrait JavaScript qui effectue une requête POST vers une API IA générique afin de générer du texte à partir d\'une invite. ')),
        _code('Générer du texte', 'javascript', "async function generateText(prompt) {\n    const apiKey = 'your-api-key';\n    const apiUrl = 'https://api.example.com/generate-text';\n\n    const response = await fetch(apiUrl, {\n        method: 'POST',\n        headers: {\n            'Content-Type': 'application/json',\n            'Authorization': `Bearer ${apiKey}`\n        },\n        body: JSON.stringify({\n            model: 'text-generation-model',\n            prompt: prompt,\n            max_tokens: 50\n        })\n    });\n\n    const data = await response.json();\n    console.log(data.choices[0].text.trim());\n}\n\n// Exemple d'utilisation\ngenerateText(\"Il était une fois dans un pays lointain,\");\n"),
        _h('h2', _text('IoT : connecter le monde qui nous entoure')),
        _p(_text('Dans le paysage technologique en évolution rapide d\'aujourd\'hui, l\'Internet des objets (IoT) se distingue comme une force révolutionnaire. De la transformation de nos résidences avec des systèmes de maison intelligente à la redéfinition du transport par les voitures connectées, l\'influence de l\'IoT est palpable dans presque toutes les facettes de notre vie quotidienne.')),
        _p(_text('Cette technologie repose sur l\'intégration transparente des appareils et des systèmes, leur permettant de communiquer et de collaborer sans effort. Avec chaque appareil connecté, nous faisons un pas de plus vers un monde où le confort et l\'efficacité sont intégrés dans le tissu même de notre existence. Par conséquent, nous transitionnons vers une ère où notre environnement répond intuitivement à nos besoins, annonçant une communauté mondiale plus intelligente et plus interconnectée.')),
        _media(image2Doc.id),
        dynamicBanner,
      ),
      meta: {
        title: 'Horizons numériques : un aperçu de demain',
        description: 'Plongez dans les merveilles de l\'innovation moderne, où le seul constant est le changement. Un voyage où pixels et données convergent pour façonner l\'avenir.',
        image: image1Doc.id,
      },
    },
    context: { disableRevalidate: true },
  })

  // --- Post 2: Global Gaze ---
  await payload.update({
    collection: 'posts',
    id: post2Doc.id,
    locale: 'fr',
    data: {
      title: 'Regard mondial : au-delà des gros titres',
      content: _root(
        _h('h2', _text('Explorez l\'inexploré et le négligé. Un regard amplifié sur les recoins du monde, où chaque histoire mérite d\'être mise en lumière.')),
        disclaimerBanner,
        _h('h2', _text('La force de la résilience : histoires de rétablissement et d\'espoir')),
        _p(_text('Tout au long de l\'histoire, des régions du monde entier ont subi l\'impact dévastateur de catastrophes naturelles, la turbulence de l\'instabilité politique et les vagues difficiles des récessions économiques. Dans ces moments de crise profonde, une force souvent sous-estimée émerge : la résilience indomptable de l\'esprit humain. Ce ne sont pas simplement des récits de survie, mais des histoires de communautés forgeant des liens, s\'unissant dans un but collectif et démontrant une capacité innée à surmonter les épreuves.')),
        _media(image3Doc.id),
        _p(_text('Des voisins formant des équipes de secours improvisées lors d\'inondations aux villes entières se ralliant pour reconstruire après un effondrement économique, l\'essence de l\'humanité est plus évidente dans ces actes de solidarité. En explorant ces récits, nous sommes témoins du pouvoir transformateur de l\'esprit communautaire, où l\'adversité devient un catalyseur de croissance, d\'unité et d\'un avenir plus lumineux et reconstruit.')),
        dynamicBanner,
      ),
      meta: {
        title: 'Regard mondial : au-delà des gros titres',
        description: 'Explorez l\'inexploré et le négligé. Un regard amplifié sur les recoins du monde, où chaque histoire mérite d\'être mise en lumière.',
        image: image2Doc.id,
      },
    },
    context: { disableRevalidate: true },
  })

  // --- Post 3: Dollar and Sense ---
  await payload.update({
    collection: 'posts',
    id: post3Doc.id,
    locale: 'fr',
    data: {
      title: 'Dollars et bon sens : les prévisions financières',
      content: _root(
        disclaimerBanner,
        _h('h2',
          _text('L\'argent n\'est pas seulement une monnaie ; '),
          _text('c\'est un langage. ', 2),
          _text('Plongez dans ses nuances, où la stratégie rencontre l\'intuition dans le vaste océan de la finance.'),
        ),
        _p(_text('L\'argent, dans son essence, transcende le simple concept de pièces et de billets ; il devient un langage profond qui parle de valeur, de confiance et de structures sociétales. Comme tout langage, il possède des nuances et des subtilités complexes qui exigent une compréhension avisée. C\'est dans ces profondeurs que le monde calculé de la stratégie financière entre en collision avec la nature brute et instinctive de l\'intuition humaine. Tout comme un linguiste chevronné pourrait disséquer la syntaxe et la sémantique d\'une phrase, un expert financier navigue dans le vaste et tumultueux océan de la finance, guidé non seulement par la logique et les données, mais aussi par l\'instinct et la prévoyance. Chaque transaction, investissement et décision financière devient un dialogue dans ce vaste lexique du commerce et de la valeur.')),
        _media(image1Doc.id),
        _h('h2', _text('Dynamiques boursières : haussiers, baissiers et l\'incertitude entre les deux')),
        _p(_text('Le marché boursier est un domaine de vastes opportunités mais qui comporte aussi des risques. Découvrez les forces qui animent les tendances du marché et les stratégies employées par les meilleurs traders pour naviguer dans cet écosystème complexe. De l\'analyse de marché à la compréhension de la psychologie des investisseurs, obtenez un aperçu complet du monde des actions.')),
        _p(_text('Le marché boursier, souvent visualisé comme une arène animée de chiffres et de téléscripteurs, concerne autant le comportement humain que l\'économie. C\'est un lieu où l\'optimisme, représenté par la hausse des marchés, rencontre la prudence des baisses, chacun cherchant à dicter la direction du marché. Mais entre ces deux extrêmes se trouve un terrain incertain, une zone peuplée de traders et d\'investisseurs qui pèsent constamment l\'espoir contre la peur. Naviguer avec succès demande plus qu\'une simple expertise financière ; cela exige une compréhension des sentiments collectifs et la capacité de prédire non seulement les mouvements du marché, mais aussi les réactions des autres participants. Dans cette danse complexe de chiffres et de nerfs, les acteurs les plus astucieux sont ceux qui maîtrisent à la fois les données concrètes et les nuances subtiles du comportement humain.')),
        dynamicBanner,
      ),
      meta: {
        title: 'Dollars et bon sens : les prévisions financières',
        description: 'L\'argent n\'est pas seulement une monnaie ; c\'est un langage. Plongez dans ses nuances, où la stratégie rencontre l\'intuition dans le vaste océan de la finance.',
        image: image3Doc.id,
      },
    },
    context: { disableRevalidate: true },
  })

  // --- Home page ---
  // Include hero link row IDs so Payload updates existing rows (preserving EN labels)
  // rather than replacing the array (which would destroy EN labels since hero.links is not localized)
  await payload.update({
    collection: 'pages',
    id: homePage.id,
    locale: 'fr',
    data: {
      title: 'Accueil',
      hero: {
        type: 'highImpact',
        links: [
          {
            id: homePage.hero.links?.[0]?.id,
            link: {
              type: 'custom',
              appearance: 'default',
              label: 'Tous les articles',
              url: '/posts',
            },
          },
          {
            id: homePage.hero.links?.[1]?.id,
            link: {
              type: 'custom',
              appearance: 'outline',
              label: 'Contact',
              url: '/contact',
            },
          },
        ],
        media: imageHomeDoc.id,
        richText: _root(
          _h('h1', _text('Modèle de site Web Payload')),
          _p(
            _link('Visitez le tableau de bord d\'administration', '/admin') as any,
            _text(' pour commencer à gérer le contenu de ce site. Le code de ce modèle est entièrement open source et peut être trouvé '),
            _link('sur notre Github', 'https://github.com/payloadcms/payload/tree/main/templates/website', true) as any,
            _text('. '),
          ),
        ),
      },
      layout: [
        {
          blockName: 'Bloc de contenu',
          blockType: 'content',
          columns: [
            {
              richText: _root(
                _h('h2', _text('Fonctionnalités principales')),
              ),
              size: 'full',
            },
            {
              enableLink: false,
              richText: _root(
                _h('h3', _text('Tableau de bord')),
                _p(
                  _text('Gérez les pages et les articles de ce site depuis le '),
                  _link('tableau de bord d\'administration', '/admin') as any,
                  _text('.'),
                ),
              ),
              size: 'oneThird',
            },
            {
              enableLink: false,
              richText: _root(
                _h('h3', _text('Aperçu')),
                _p(_text('Grâce aux versions, aux brouillons et à l\'aperçu, les éditeurs peuvent réviser et partager leurs modifications avant de les publier.')),
              ),
              size: 'oneThird',
            },
            {
              enableLink: false,
              richText: _root(
                _h('h3', _text('Constructeur de pages')),
                _p(_text('Le constructeur de pages personnalisé vous permet de créer des mises en page uniques pour tout type de contenu.')),
              ),
              size: 'oneThird',
            },
            {
              enableLink: false,
              richText: _root(
                _h('h3', _text('SEO')),
                _p(
                  _text('Les éditeurs ont un contrôle total sur les données SEO et le contenu du site directement depuis le '),
                  _link('tableau de bord d\'administration', '/admin') as any,
                  _text('.'),
                ),
              ),
              size: 'oneThird',
            },
            {
              enableLink: false,
              richText: _root(
                _h('h3', _text('Mode sombre')),
                _p(_text('Les utilisateurs verront ce site dans leur schéma de couleurs préféré et chaque bloc peut être inversé.')),
              ),
              size: 'oneThird',
            },
          ],
        },
        {
          blockName: 'Bloc média',
          blockType: 'mediaBlock',
          media: image2Doc.id,
        },
        {
          blockName: 'Bloc d\'archives',
          blockType: 'archive',
          categories: [],
          introContent: _root(
            _h('h3', _text('Articles récents')),
            _p(_text('Les articles ci-dessous sont affichés dans un bloc de mise en page « Archive », un moyen extrêmement puissant d\'afficher des documents sur une page. Il peut être alimenté automatiquement par collection ou par catégorie, ou les articles peuvent être sélectionnés individuellement. Les contrôles de pagination apparaîtront automatiquement si le nombre de résultats dépasse le nombre d\'éléments par page.')),
          ),
          populateBy: 'collection',
          relationTo: 'posts',
        },
        {
          blockName: 'Appel à l\'action',
          blockType: 'cta',
          links: [
            {
              link: {
                type: 'custom',
                appearance: 'default',
                label: 'Tous les articles',
                url: '/posts',
              },
            },
          ],
          richText: _root(
            _h('h3', _text('Ceci est un appel à l\'action')),
            _p(
              _text('Ceci est un bloc de mise en page personnalisé '),
              _link('configuré dans le tableau de bord d\'administration', '/admin') as any,
              _text('.'),
            ),
          ),
        },
      ],
      meta: {
        title: 'Modèle de site Web Payload',
        description: 'Un site Web open source construit avec Payload et Next.js.',
        image: imageHomeDoc.id,
      },
    },
    context: { disableRevalidate: true },
  })

  // --- Contact page ---
  await payload.update({
    collection: 'pages',
    id: contactPage.id,
    locale: 'fr',
    data: {
      title: 'Contact',
      layout: [
        {
          blockType: 'formBlock',
          enableIntro: true,
          form: contactForm.id,
          introContent: _root(
            _h('h3', _text('Exemple de formulaire de contact :')),
          ),
        },
      ],
    },
    context: { disableRevalidate: true },
  })

  // --- Media (alt + captions) ---
  // image1 and image2 have captions in English; image3 and imageHome do not
  await payload.update({
    collection: 'media',
    id: image1Doc.id,
    locale: 'fr',
    data: {
      alt: 'Formes abstraites courbées avec un dégradé orange et bleu',
      caption: _root(
        _p(
          _text('Photo par '),
          _link('Andrew Kliatskyi', 'https://unsplash.com/@kirp', true) as any,
          _text(' sur Unsplash.'),
        ),
      ),
    },
  })
  await payload.update({
    collection: 'media',
    id: image2Doc.id,
    locale: 'fr',
    data: {
      alt: 'Formes abstraites courbées avec un dégradé orange et bleu',
      caption: _root(
        _p(
          _text('Photo par '),
          _link('Andrew Kliatskyi', 'https://unsplash.com/@kirp', true) as any,
          _text(' sur Unsplash.'),
        ),
      ),
    },
  })
  await payload.update({
    collection: 'media',
    id: image3Doc.id,
    locale: 'fr',
    data: {
      alt: 'Formes métalliques droites avec un dégradé orange et bleu',
    },
  })
  await payload.update({
    collection: 'media',
    id: imageHomeDoc.id,
    locale: 'fr',
    data: {
      alt: 'Formes métalliques droites avec un dégradé bleu',
    },
  })

  // --- Globals ---
  // Include navItem row IDs to preserve EN labels (navItems array is not localized)
  await payload.updateGlobal({
    slug: 'header',
    locale: 'fr',
    data: {
      navItems: [
        {
          id: headerResult.navItems?.[0]?.id,
          link: {
            type: 'custom',
            label: 'Articles',
            url: '/posts',
          },
        },
        {
          id: headerResult.navItems?.[1]?.id,
          link: {
            type: 'reference',
            label: 'Contact',
            reference: {
              relationTo: 'pages',
              value: contactPage.id,
            },
          },
        },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    locale: 'fr',
    data: {
      navItems: [
        {
          id: footerResult.navItems?.[0]?.id,
          link: {
            type: 'custom',
            label: 'Administration',
            url: '/admin',
          },
        },
        {
          id: footerResult.navItems?.[1]?.id,
          link: {
            type: 'custom',
            label: 'Code source',
            newTab: true,
            url: 'https://github.com/payloadcms/payload/tree/main/templates/website',
          },
        },
        {
          id: footerResult.navItems?.[2]?.id,
          link: {
            type: 'custom',
            label: 'Payload',
            newTab: true,
            url: 'https://payloadcms.com/',
          },
        },
      ],
    },
  })

  payload.logger.info('Seeded French translations successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
