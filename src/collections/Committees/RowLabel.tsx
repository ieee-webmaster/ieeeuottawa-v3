'use client'

import { createReferenceRowLabel } from '@/components/ReferenceRowLabel'

export const CommitteeTeamRowLabel = createReferenceRowLabel({
  collection: 'teams',
  referenceField: 'team',
})

export const CommitteeMemberRowLabel = createReferenceRowLabel({
  collection: 'people',
  fallbackPrefix: 'Member',
  referenceField: 'person',
})
