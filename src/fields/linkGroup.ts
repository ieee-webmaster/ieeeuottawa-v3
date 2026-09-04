import type { ArrayField } from 'payload'

import type { LinkAppearances } from './link'

import { link } from './link'

type LinkGroupType = (options?: {
  appearances?: LinkAppearances[] | false
  overrides?: Partial<ArrayField>
}) => ArrayField

export const linkGroup: LinkGroupType = ({ appearances, overrides = {} } = {}) => {
  const generatedLinkGroup: ArrayField = {
    name: 'links',
    type: 'array',
    fields: [
      link({
        appearances,
      }),
    ],
    admin: {
      initCollapsed: true,
    },
  }

  return {
    ...generatedLinkGroup,
    ...overrides,
    admin: { ...generatedLinkGroup.admin, ...overrides.admin },
  }
}
