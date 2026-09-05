import React from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import type { CodeBlock as CodeBlockProps } from '@/payload-types'

import { CopyButton } from './CopyButton'

type Props = CodeBlockProps & {
  className?: string
}

export const CodeBlock: React.FC<Props> = ({ className, code, language }) => {
  return (
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      {code ? (
        <Highlight code={code} language={language ?? ''} theme={themes.vsDark}>
          {({ getLineProps, getTokenProps, tokens }) => (
            <pre className="bg-black p-4 border text-xs border-border rounded overflow-x-auto">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ className: 'table-row', line })}>
                  <span className="table-cell select-none text-right text-white/25">{i + 1}</span>
                  <span className="table-cell pl-4">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
              <CopyButton code={code} />
            </pre>
          )}
        </Highlight>
      ) : null}
    </div>
  )
}
