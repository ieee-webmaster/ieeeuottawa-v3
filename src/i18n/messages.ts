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
      goHome: "Retour à l'accueil",
      switchToEnglish: "Passer à l'anglais",
      switchToFrench: 'Passer au français',
    },
    footer: {
      rightsReserved: 'Tous droits réservés.',
    },
    notFound: {
      description: 'Cette page est introuvable.',
    },
    searchPage: {
      title: 'Recherche',
      noResults: 'Aucun résultat trouvé.',
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
      titleSuffix: 'Comité',
    },
    events: {
      title: 'Événements',
      intro: 'Parcourez les événements à venir et passés organisés par IEEE UOttawa.',
      upcoming: 'À venir',
      past: 'Passés',
      noUpcoming: 'Aucun événement à venir.',
      noPast: 'Aucun événement passé.',
      eventLabel: 'Événement',
      location: 'Lieu',
      hostedBy: 'Organisé par',
      register: 'Inscription',
      signUp: "S'inscrire / En savoir plus",
      viewMedia: "Voir les médias de l'événement",
      eventSingular: 'événement',
      eventCount: (count: number) => `${count} événement${count !== 1 ? 's' : ''}`,
    },
    pagination: {
      previous: 'Précédent',
      next: 'Suivant',
      morePages: 'Plus de pages',
      goToPrevious: 'Aller à la page précédente',
      goToNext: 'Aller à la page suivante',
      noResults: "La recherche n'a produit aucun résultat.",
      showing: (start: number, end: number, total: number, label: string) =>
        `Affichage de ${start}${start > 0 ? ` - ${end}` : ''} sur ${total} ${label}`,
      defaultDocSingular: 'document',
      defaultDocPlural: 'documents',
    },
    admin: {
      welcomeTitle: 'Bienvenue dans votre tableau de bord!',
      beforeLoginBody: 'Les administrateurs du site se connecteront ici pour gérer votre site web.',
      nextSteps: 'Voici les prochaines étapes :',
      seedLead: 'avec quelques pages, articles et projets pour lancer votre nouveau site, puis',
      visitWebsite: 'visitez votre site web',
      seedTail: 'pour voir le résultat.',
      modifyPrefix: 'Modifiez vos',
      collections: 'collections',
      modifyMiddle: 'et ajoutez plus de',
      fields: 'champs',
      modifySuffix:
        'selon vos besoins. Si vous débutez avec Payload, nous vous recommandons aussi de consulter la',
      gettingStarted: 'documentation de démarrage',
      docsSuffix: '.',
      commitHint:
        'Validez et poussez vos changements vers le dépôt pour déclencher un redéploiement du projet.',
      proTipPrefix: 'Astuce: Ce bloc est un',
      customComponent: 'composant personnalisé',
      proTipSuffix: ', vous pouvez le supprimer à tout moment en modifiant votre',
    },
  },
} as const

export const getMessages = (locale?: string) => {
  const resolvedLocale: AppLocale = locale === 'fr' ? 'fr' : defaultLocale
  return messages[resolvedLocale]
}
