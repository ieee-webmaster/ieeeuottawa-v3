import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const renderedExtensions = new Set(['.html', '.txt', '.json', '.css'])
const localMediaPattern = /(?:\/(?:media|_next\/static\/media)\/|(?:\.\.\/)+media\/)[^\s"'<>?\\)]+/g
const blobPattern = /https?:\/\/[^\s"'<>\\]*\.blob\.vercel-storage\.com[^\s"'<>\\]*/g

const readRenderedContent = (raw: string, isHTML: boolean) => {
  if (!isHTML) return raw
  const flightChunks: string[] = []
  // Next can split a URL across successive serialized React payload chunks.
  // Reassemble those strings before checking references; never execute the scripts.
  const markup = raw.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_, script: string) => {
    const payload = script.match(/^self\.__next_f\.push\(([\s\S]*)\);?$/)?.[1]
    if (payload) {
      const chunk: unknown = JSON.parse(payload)
      if (Array.isArray(chunk) && chunk[0] === 1 && typeof chunk[1] === 'string') {
        flightChunks.push(chunk[1])
      }
    }
    return ''
  })
  return `${markup}\n${flightChunks.join('')}`
}

const walk = async (directory: string): Promise<string[]> => {
  const files: string[] = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(filename)))
    else if (entry.isFile() && renderedExtensions.has(path.extname(filename))) files.push(filename)
  }
  return files
}

/** Check HTML, client-navigation payloads and styles against the actual deployment files. */
export const verifyStaticMedia = async (outputDirectory: string) => {
  const root = path.resolve(outputDirectory)
  const files = await walk(root)
  const references = new Map<string, string>()
  const failures = new Set<string>()
  let pages = 0

  for (const file of files) {
    const relative = path.relative(root, file)
    const recordReference = (value: string) => {
      if (/^(?:[a-z]+:|\/\/|#)/i.test(value)) return
      const reference = value.split(/[?#]/)[0]
      if (!reference) return
      const url = reference.startsWith('/')
        ? reference
        : path.posix.join('/', path.relative(root, path.dirname(file)), reference)
      references.set(url, relative)
    }
    if (file.endsWith('.html')) pages += 1
    const content = readRenderedContent(
      await readFile(file, 'utf8'),
      file.endsWith('.html'),
    ).replaceAll('\\/', '/')
    for (const match of content.matchAll(blobPattern)) {
      failures.add(`${relative}: still references Vercel Blob (${match[0]})`)
    }
    for (const match of content.matchAll(localMediaPattern)) {
      recordReference(match[0])
    }
    // These are Next-generated tags, including responsive and preload image candidates.
    for (const tag of content.matchAll(/<(?:img|source|video|link)\b[^>]*>/gi)) {
      for (const attribute of tag[0].matchAll(
        /\b(src|srcset|poster|imagesrcset)=["']([^"']*)["']/gi,
      )) {
        const [, name, value] = attribute
        if (!name || value === undefined) continue
        if (name.toLowerCase().endsWith('srcset')) {
          if (value.startsWith('data:')) continue
          for (const candidate of value.split(',')) {
            recordReference(candidate.trim().split(/\s+/)[0] ?? '')
          }
        } else recordReference(value)
      }
    }
    if (/\/(?:_next\/image|api\/media\/file)(?:[?\/"'])/.test(content)) {
      failures.add(`${relative}: still references a runtime image endpoint`)
    }
  }

  if (!pages) failures.add('No exported HTML pages found')

  for (const [url, source] of references) {
    let filename: string
    try {
      filename = path.resolve(root, `.${decodeURIComponent(url)}`)
    } catch {
      failures.add(`${source}: invalid media URL ${url}`)
      continue
    }
    if (!filename.startsWith(`${root}${path.sep}`)) {
      failures.add(`${source}: media path escapes the export (${url})`)
      continue
    }
    const info = await stat(filename).catch(() => null)
    if (!info?.isFile() || info.size === 0) {
      failures.add(`${source}: missing or empty media file ${url}`)
    }
  }

  if (failures.size)
    throw new Error(`Static media verification failed:\n${[...failures].join('\n')}`)
  return { pages, assets: references.size }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await verifyStaticMedia('out')
  console.log(
    `Static media verified: ${result.assets} referenced assets across ${result.pages} pages`,
  )
}
