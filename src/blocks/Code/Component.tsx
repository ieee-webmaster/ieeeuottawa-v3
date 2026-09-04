import React from 'react'
import type { CodeBlock as CodeBlockProps } from '@/payload-types'

import { Code } from './Component.client'

type Props = CodeBlockProps & {
  className?: string
}

export const CodeBlock: React.FC<Props> = ({ className, code, language }) => {
  return (
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <Code code={code} language={language} />
    </div>
  )
}
