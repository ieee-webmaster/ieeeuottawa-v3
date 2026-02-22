import { defaultLocale, type AppLocale } from './config'

const messages = {
  en: {
    common: {
      search: 'Search',
      goHome: 'Go home',
      switchToEnglish: 'Switch to English',
      switchToFrench: 'Switch to French',
    },
    footer: {
      rightsReserved: 'All rights reserved.',
    },
    notFound: {
      description: 'This page could not be found.',
    },
    searchPage: {
      title: 'Search',
      noResults: 'No results found.',
      metadataTitle: 'Search | IEEE UOttawa',
    },
    postsPage: {
      title: 'Posts',
      metadataTitle: 'Posts | IEEE UOttawa',
      pagedMetadataTitle: (page: string) => `Posts - Page ${page || ''} | IEEE UOttawa`,
      singular: 'Post',
      plural: 'Posts',
    },
    committee: {
      titleSuffix: 'Committee',
    },
    events: {
      title: 'Events',
      intro: 'Browse upcoming and past events organized by IEEE UOttawa.',
      upcoming: 'Upcoming',
      past: 'Past',
      noUpcoming: 'No upcoming events.',
      noPast: 'No past events.',
      eventLabel: 'Event',
      location: 'Location',
      hostedBy: 'Hosted By',
      register: 'Register',
      signUp: 'Sign up / Learn more',
      viewMedia: 'View Event Media',
      eventSingular: 'event',
      eventCount: (count: number) => `${count} event${count !== 1 ? 's' : ''}`,
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      morePages: 'More pages',
      goToPrevious: 'Go to previous page',
      goToNext: 'Go to next page',
      noResults: 'Search produced no results.',
      showing: (start: number, end: number, total: number, label: string) =>
        `Showing ${start}${start > 0 ? ` - ${end}` : ''} of ${total} ${label}`,
      defaultDocSingular: 'doc',
      defaultDocPlural: 'docs',
    },
    admin: {
      welcomeTitle: 'Welcome to your dashboard!',
      beforeLoginBody: 'This is where site admins will log in to manage your website.',
      nextSteps: "Here's what to do next:",
      seedLead: 'with a few pages, posts, and projects to jump-start your new site, then',
      visitWebsite: 'visit your website',
      seedTail: 'to see the results.',
      modifyPrefix: 'Modify your',
      collections: 'collections',
      modifyMiddle: 'and add more',
      fields: 'fields',
      modifySuffix: 'as needed. If you are new to Payload, we also recommend you check out the',
      gettingStarted: 'Getting Started',
      docsSuffix: 'docs.',
      commitHint:
        'Commit and push your changes to the repository to trigger a redeployment of your project.',
      proTipPrefix: 'Pro Tip: This block is a',
      customComponent: 'custom component',
      proTipSuffix: ', you can remove it at any time by updating your',
    },
  },
  fr: {
    common: {
      search: 'Recherche',
      goHome: 'Retour a l accueil',
      switchToEnglish: 'Passer a l anglais',
      switchToFrench: 'Passer au francais',
    },
    footer: {
      rightsReserved: 'Tous droits reserves.',
    },
    notFound: {
      description: 'Cette page est introuvable.',
    },
    searchPage: {
      title: 'Recherche',
      noResults: 'Aucun resultat trouve.',
      metadataTitle: 'Recherche | IEEE UOttawa',
    },
    postsPage: {
      title: 'Articles',
      metadataTitle: 'Articles | IEEE UOttawa',
      pagedMetadataTitle: (page: string) => `Articles - Page ${page || ''} | IEEE UOttawa`,
      singular: 'Article',
      plural: 'Articles',
    },
    committee: {
      titleSuffix: 'Comite',
    },
    events: {
      title: 'Evenements',
      intro: 'Parcourez les evenements a venir et passes organises par IEEE UOttawa.',
      upcoming: 'A venir',
      past: 'Passes',
      noUpcoming: 'Aucun evenement a venir.',
      noPast: 'Aucun evenement passe.',
      eventLabel: 'Evenement',
      location: 'Lieu',
      hostedBy: 'Organise par',
      register: 'Inscription',
      signUp: 'S inscrire / En savoir plus',
      viewMedia: 'Voir les medias de l evenement',
      eventSingular: 'evenement',
      eventCount: (count: number) => `${count} evenement${count !== 1 ? 's' : ''}`,
    },
    pagination: {
      previous: 'Precedent',
      next: 'Suivant',
      morePages: 'Plus de pages',
      goToPrevious: 'Aller a la page precedente',
      goToNext: 'Aller a la page suivante',
      noResults: 'La recherche n a produit aucun resultat.',
      showing: (start: number, end: number, total: number, label: string) =>
        `Affichage de ${start}${start > 0 ? ` - ${end}` : ''} sur ${total} ${label}`,
      defaultDocSingular: 'document',
      defaultDocPlural: 'documents',
    },
    admin: {
      welcomeTitle: 'Bienvenue dans votre tableau de bord!',
      beforeLoginBody: 'Les administrateurs du site se connecteront ici pour gerer votre site web.',
      nextSteps: 'Voici les prochaines etapes:',
      seedLead: 'avec quelques pages, articles et projets pour lancer votre nouveau site, puis',
      visitWebsite: 'visitez votre site web',
      seedTail: 'pour voir le resultat.',
      modifyPrefix: 'Modifiez vos',
      collections: 'collections',
      modifyMiddle: 'et ajoutez plus de',
      fields: 'champs',
      modifySuffix:
        'selon vos besoins. Si vous debutez avec Payload, nous vous recommandons aussi de consulter la',
      gettingStarted: 'documentation de demarrage',
      docsSuffix: '.',
      commitHint:
        'Validez et poussez vos changements vers le depot pour declencher un redeploiement du projet.',
      proTipPrefix: 'Astuce: Ce bloc est un',
      customComponent: 'composant personnalise',
      proTipSuffix: ', vous pouvez le supprimer a tout moment en modifiant votre',
    },
  },
} as const

export const getMessages = (locale?: string) => {
  const resolvedLocale: AppLocale = locale === 'fr' ? 'fr' : defaultLocale
  return messages[resolvedLocale]
}
