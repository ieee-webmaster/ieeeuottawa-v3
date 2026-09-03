import { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { AccordionBlockComponent } from '@/blocks/Accordion/Component'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CardGridBlock } from '@/blocks/CardGrid/Component'
import { CommitteeTeamMembersBlock } from '@/blocks/CommitteeTeamMembers/Component'
import { CTABandBlock } from '@/blocks/CTABand/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { GalleryBlockComponent } from '@/blocks/Gallery/Component'
import { LogoGridBlock } from '@/blocks/LogoGrid/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { QuickLinksBlock } from '@/blocks/QuickLinks/Component'
import { SplitSectionBlock } from '@/blocks/SplitSection/Component'

const renderBlock = (block: Page['layout'][number]) => {
  switch (block.blockType) {
    case 'accordion':
      return <AccordionBlockComponent {...block} />
    case 'archive':
      return <ArchiveBlock {...block} />
    case 'banner':
      return <BannerBlock {...block} />
    case 'cardGrid':
      return <CardGridBlock {...block} />
    case 'committeeTeamMembers':
      return <CommitteeTeamMembersBlock {...block} />
    case 'ctaBand':
      return <CTABandBlock {...block} />
    case 'content':
      return <ContentBlock {...block} />
    case 'cta':
      return <CallToActionBlock {...block} />
    case 'formBlock':
      return null
    case 'gallery':
      return <GalleryBlockComponent {...block} />
    case 'logoGrid':
      return <LogoGridBlock {...block} />
    case 'mediaBlock':
      return <MediaBlock {...block} disableInnerContainer />
    case 'quickLinks':
      return <QuickLinksBlock {...block} />
    case 'splitSection':
      return <SplitSectionBlock {...block} />
    default: {
      const unsupported: never = block
      throw new Error(`Unsupported block: ${unsupported}`)
    }
  }
}

const blocksNeedingOuterSpacing = new Set(['cta', 'mediaBlock'])

export const RenderBlocks = ({ blocks }: { blocks: Page['layout'] }) => (
  <>
    {blocks.map((block, index) => {
      const content = renderBlock(block)
      const key = block.id ?? index
      return blocksNeedingOuterSpacing.has(block.blockType) ? (
        <div className="my-16" key={key}>
          {content}
        </div>
      ) : (
        <Fragment key={key}>{content}</Fragment>
      )
    })}
  </>
)
