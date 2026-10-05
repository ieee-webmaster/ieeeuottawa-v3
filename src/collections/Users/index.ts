import { APIError, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

import { authenticated } from '@/access/authenticated'

const protectGoogleIdentity: CollectionBeforeChangeHook<User> = ({ data, originalDoc }) => {
  if (
    originalDoc?.googleId &&
    data.googleId !== undefined &&
    data.googleId !== originalDoc.googleId
  ) {
    throw new APIError('A linked Google identity cannot be replaced.', 403)
  }
  return data
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  // Keep Payload's session storage, refresh and revocation. Password operations are denied below.
  auth: { useSessions: true },
  hooks: {
    beforeOperation: [
      ({ operation, req }) => {
        if (
          ['login', 'forgotPassword', 'resetPassword'].includes(operation) ||
          (operation === 'create' && !req.user && !req.context.googleOAuth)
        ) {
          throw new APIError('Sign in with your @ieeeuottawa.ca Google account.', 403)
        }
      },
    ],
    beforeChange: [protectGoogleIdentity],
  },
  fields: [
    {
      name: 'googleId',
      type: 'text',
      unique: true,
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}
