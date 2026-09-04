import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { z } from 'zod'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { resolveContentPathFromDoc } from '@/routing/resolveContentPath'

import { resolveLocale } from '@/i18n/routing'
import { getAbsoluteUrl, prefixLocale } from '@/utilities/routes'
import { formatSiteTitle } from '@/utilities/siteMetadata'

const categoryBreadcrumbsSchema = z.array(z.object({ slug: z.string().nullish() }))

const generateTitle: GenerateTitle<{ title?: string | null }> = ({ doc }) => {
  return formatSiteTitle(doc?.title)
}

const generateURL: GenerateURL<Record<string, unknown>> = ({ collectionConfig, doc, locale }) => {
  if (!doc || !locale || !collectionConfig?.slug) {
    return ''
  }

  const path = resolveContentPathFromDoc(collectionConfig.slug, doc)
  if (!path) {
    return ''
  }

  return getAbsoluteUrl(prefixLocale(path, resolveLocale(locale)))
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if (field.type === 'text' && field.name === 'from') {
            return {
              ...field,
              admin: {
                ...field.admin,
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) =>
      categoryBreadcrumbsSchema
        .parse(docs)
        .reduce((url, { slug }) => (slug ? `${url}/${slug}` : url), ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if (field.type === 'richText' && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
