import React, { type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'

import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { SectionShell } from '@/blocks/_shared'
import { cn } from '@/utilities/ui'
import styles from './index.module.css'

type ImageFramingStyle = CSSProperties &
  Record<`--hero-${'desktop' | 'mobile'}-${'x' | 'y' | 'zoom'}`, string | number>

type HighImpactHeroProps = Page['hero'] & {
  imageLayout?: 'offset' | 'background'
}

export const HighImpactHero: React.FC<HighImpactHeroProps> = ({
  links,
  media,
  richText,
  imagePosition,
  imageLayout = 'offset',
}) => {
  const image = media && typeof media === 'object' ? media : null
  const framing: ImageFramingStyle = {
    '--hero-desktop-x': `${imagePosition?.desktop?.x ?? 50}%`,
    '--hero-desktop-y': `${imagePosition?.desktop?.y ?? 50}%`,
    '--hero-desktop-zoom': (imagePosition?.desktop?.zoom ?? 100) / 100,
    '--hero-mobile-x': `${imagePosition?.mobile?.x ?? 50}%`,
    '--hero-mobile-y': `${imagePosition?.mobile?.y ?? 50}%`,
    '--hero-mobile-zoom': (imagePosition?.mobile?.zoom ?? 100) / 100,
  }

  return (
    <SectionShell
      theme="dark"
      padding=""
      bare
      className={cn(
        styles.hero,
        image && styles.withMedia,
        imageLayout === 'background' && styles.backgroundImage,
      )}
    >
      {image && (
        <div className={styles.media} style={framing}>
          <Media
            className={styles.image}
            imgClassName={styles.imageElement}
            pictureClassName={styles.picture}
            videoClassName={styles.imageElement}
            priority
            resource={image}
            sizes={imageLayout === 'background' ? '100vw' : '(min-width: 1024px) 75vw, 100vw'}
          />
        </div>
      )}
      <div className={cn('container', styles.content)}>
        {richText && <RichText className={styles.copy} data={richText} enableGutter={false} />}
        {links && links.length > 0 && (
          <ul className={styles.actions}>
            {links.map(({ id, link }, index) => (
              <li key={id ?? index}>
                <CMSLink
                  {...link}
                  size="lg"
                  className={cn(styles.action, link.appearance === 'default' && styles.primary)}
                >
                  {index === 0 && link.appearance === 'default' && (
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                  )}
                </CMSLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionShell>
  )
}
