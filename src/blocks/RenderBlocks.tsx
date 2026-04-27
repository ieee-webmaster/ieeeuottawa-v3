import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { AccordionBlockComponent } from '@/blocks/Accordion/Component'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CardGridBlock } from '@/blocks/CardGrid/Component'
import { CTABandBlock } from '@/blocks/CTABand/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { GalleryBlockComponent } from '@/blocks/Gallery/Component'
import { LogoGridBlock } from '@/blocks/LogoGrid/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { QuickLinksBlock } from '@/blocks/QuickLinks/Component'
import { SplitSectionBlock } from '@/blocks/SplitSection/Component'

const blockComponents = {
  accordion: AccordionBlockComponent,
  archive: ArchiveBlock,
  banner: BannerBlock,
  cardGrid: CardGridBlock,
  ctaBand: CTABandBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  gallery: GalleryBlockComponent,
  logoGrid: LogoGridBlock,
  mediaBlock: MediaBlock,
  quickLinks: QuickLinksBlock,
  splitSection: SplitSectionBlock,
}

const blocksNeedingOuterSpacing = new Set(['cta', 'formBlock', 'mediaBlock'])

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block
          const key = block.id ?? index

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              const renderedBlock = (
                <>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </>
              )

              if (blocksNeedingOuterSpacing.has(blockType)) {
                return (
                  <div className="my-16" key={key}>
                    {renderedBlock}
                  </div>
                )
              }

              return <Fragment key={key}>{renderedBlock}</Fragment>
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
