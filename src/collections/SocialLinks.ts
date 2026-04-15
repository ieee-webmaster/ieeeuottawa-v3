import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateTag } from 'next/cache'

import { validateHttpUrl } from '@/utilities/validateHttpUrl'

const revalidateLinkedGlobals = () => {
  revalidateTag('global_header')
  revalidateTag('global_footer')
}

const revalidateSocialLink: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating header and footer after social link change')
    revalidateLinkedGlobals()
  }

  return doc
}

const revalidateDeletedSocialLink: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating header and footer after social link delete')
    revalidateLinkedGlobals()
  }

  return doc
}

export const SocialLinks: CollectionConfig = {
  slug: 'socialLinks',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'url', 'updatedAt'],
    description: 'Reusable social links for the header and footer.',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Platform name shown in accessible labels, and optionally in the header.',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: validateHttpUrl,
      admin: {
        placeholder: 'https://...',
      },
    },
    {
      name: 'lightIcon',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Dark icon for light backgrounds (SVG recommended).',
      },
    },
    {
      name: 'darkIcon',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Light icon for dark backgrounds (SVG recommended).',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateSocialLink],
    afterDelete: [revalidateDeletedSocialLink],
  },
}
