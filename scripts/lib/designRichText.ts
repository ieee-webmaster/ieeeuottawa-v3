import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export const richText = (paragraph: string, title?: string): DefaultTypedEditorState => {
  const children: DefaultTypedEditorState['root']['children'] = [
    {
      type: 'paragraph',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      children: [
        {
          type: 'text',
          text: paragraph,
          version: 1,
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
        },
      ],
    },
  ]
  if (title)
    children.unshift({
      type: 'heading',
      tag: 'h1',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [
        { type: 'text', text: title, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
      ],
    })
  return { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children } }
}
