// Legacy imports include Markdown links in this plain-text field.
export const formatEventLocation = (location: string): string =>
  location.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1')
