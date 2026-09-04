import RichText from '@/components/RichText'
import React from 'react'

import { Width } from '../Width'
import type { FormField } from '../types'

export const Message: React.FC<Extract<FormField, { blockType: 'message' }>> = ({ message }) => {
  return (
    <Width className="my-12" width="100">
      {message && <RichText data={message} />}
    </Width>
  )
}
