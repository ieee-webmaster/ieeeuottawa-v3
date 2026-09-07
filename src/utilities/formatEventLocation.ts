// Legacy imports include Markdown links in this plain-text field.
export const formatEventLocation = (location: string): string => {
  let result = ''
  let copiedThrough = 0

  for (const match of location.matchAll(/\[([^\]]+)\]\(https?:\/\//g)) {
    if (match.index < copiedThrough) continue

    let depth = 1
    for (let index = match.index + match[0].length; index < location.length; index++) {
      const character = location[index]
      if (character === '\\') {
        index++
      } else if (character === '(') {
        depth++
      } else if (character === ')') {
        depth--
        if (depth === 0) {
          result += location.slice(copiedThrough, match.index) + match[1]
          copiedThrough = index + 1
          break
        }
      }
    }
  }

  return result + location.slice(copiedThrough)
}
