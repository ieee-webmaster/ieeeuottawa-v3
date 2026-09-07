import React from 'react'

import type { Page } from '@/payload-types'

import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import { AffinityGroupHero } from '@/heros/AffinityGroup'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
  affinityGroup: AffinityGroupHero,
}

export const RenderHero: React.FC<Page['hero'] & { isHomePage?: boolean }> = ({
  isHomePage = false,
  ...props
}) => {
  const { type } = props

  if (!type || type === 'none') return null

  if (type === 'highImpact') {
    return <HighImpactHero {...props} imageLayout={isHomePage ? 'offset' : 'background'} />
  }

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
