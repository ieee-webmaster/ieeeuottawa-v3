export type UrlValidationResult = true | string

export const validateHttpUrl = (value: string | null | undefined): UrlValidationResult => {
  if (!value) return true

  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'Link must start with http:// or https://'
    }
    return true
  } catch {
    return 'Link must be a valid URL'
  }
}
