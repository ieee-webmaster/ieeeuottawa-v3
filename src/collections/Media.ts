import type { CollectionConfig, ImageSize } from 'payload'
import path from 'node:path'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import {
  buildPublicCacheAfterChange,
  buildPublicCacheAfterDelete,
} from '@/hooks/revalidatePublicContent'
import { PUBLIC_CACHE_TAGS } from '@/utilities/publicCache'
import { populateStaticMediaURLs } from './Media/populateStaticMediaURLs'

const defineMediaImageSizes = <const Sizes extends ImageSize[]>(sizes: Sizes) => sizes

export const MEDIA_IMAGE_SIZES = defineMediaImageSizes([
  {
    name: 'thumbnail',
    width: 300,
    withoutEnlargement: true,
  },
  {
    name: 'square',
    width: 500,
    height: 500,
    withoutEnlargement: true,
  },
  {
    name: 'small',
    width: 600,
    withoutEnlargement: true,
  },
  {
    name: 'medium',
    width: 900,
    withoutEnlargement: true,
  },
  {
    name: 'large',
    width: 1400,
    withoutEnlargement: true,
  },
  {
    name: 'xlarge',
    width: 1920,
    withoutEnlargement: true,
  },
  {
    name: 'og',
    width: 1200,
    height: 630,
    crop: 'center',
    withoutEnlargement: true,
  },
])

export const Media: CollectionConfig<'media'> = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    alt: true,
    filename: true,
    height: true,
    mimeType: true,
    sizes: {
      large: {
        filename: true,
        height: true,
        url: true,
        width: true,
      },
      medium: {
        filename: true,
        height: true,
        url: true,
        width: true,
      },
      og: {
        filename: true,
        height: true,
        url: true,
        width: true,
      },
      small: {
        filename: true,
        height: true,
        url: true,
        width: true,
      },
      thumbnail: {
        filename: true,
        height: true,
        url: true,
        width: true,
      },
      xlarge: {
        filename: true,
        height: true,
        url: true,
        width: true,
      },
    },
    updatedAt: true,
    url: true,
    width: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  hooks: {
    afterChange: [buildPublicCacheAfterChange(PUBLIC_CACHE_TAGS.media)],
    afterDelete: [buildPublicCacheAfterDelete(PUBLIC_CACHE_TAGS.media)],
    afterRead: [populateStaticMediaURLs],
  },
  upload: {
    disableLocalStorage: process.env.PRODUCTION_EDITOR !== '1',
    staticDir:
      process.env.PRODUCTION_EDITOR === '1'
        ? process.env.STATIC_MEDIA_RUNTIME_DIR || path.resolve('.production-editor/media')
        : undefined,
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: MEDIA_IMAGE_SIZES,
  },
}
