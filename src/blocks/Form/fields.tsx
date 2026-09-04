import type { FormField } from './types'
import { Checkbox } from './Checkbox'
import { Email } from './Email'
import { Message } from './Message'
import { Number } from './Number'
import { Select } from './Select'
import { Text } from './Text'
import { Textarea } from './Textarea'

export const RenderFormField = ({ field }: { field: FormField }) => {
  switch (field.blockType) {
    case 'checkbox':
      return <Checkbox {...field} />
    case 'email':
      return <Email {...field} />
    case 'message':
      return <Message {...field} />
    case 'number':
      return <Number {...field} />
    case 'country':
    case 'state':
    case 'select':
      return <Select {...field} />
    case 'text':
      return <Text {...field} />
    case 'textarea':
      return <Textarea {...field} />
    default: {
      const unsupported: never = field
      throw new Error(`Unsupported form field: ${unsupported}`)
    }
  }
}
