// @vitest-environment node
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { verifyStaticMedia } from '../../scripts/verify-static-media'

let output: string
beforeEach(async () => {
  output = await mkdtemp(path.join(os.tmpdir(), 'static-media-test-'))
  await mkdir(path.join(output, 'media'))
  await mkdir(path.join(output, '_next/static/media'), { recursive: true })
})
afterEach(async () => {
  await rm(output, { recursive: true, force: true })
})
const write = (file: string, content: string) => writeFile(path.join(output, file), content)

describe('static deployment media verification', () => {
  it('accepts bundled CMS assets, encoded filenames, and imported portraits', async () => {
    await write(
      'index.html',
      '<img src="/media/team%20photo.jpg?updated=1" srcset="/media/team-small.jpg 300w, /media/team%20photo.jpg 800w"><img src="/_next/static/media/portrait.123.png">',
    )
    await write('media/team photo.jpg', 'original')
    await write('media/team-small.jpg', 'rendition')
    await write('_next/static/media/portrait.123.png', 'portrait')
    await expect(verifyStaticMedia(output)).resolves.toEqual({ pages: 1, assets: 3 })
  })

  it('rejects a missing responsive candidate even when the fallback image exists', async () => {
    await write(
      'index.html',
      '<img src="/media/team.jpg" srcset="/media/team.jpg 300w, /media/team-large.jpg 1400w">',
    )
    await write('media/team.jpg', 'original')
    await expect(verifyStaticMedia(output)).rejects.toThrow(
      'missing or empty media file /media/team-large.jpg',
    )
  })

  it('checks serialized client-navigation data and stylesheet image references', async () => {
    await write('index.html', '<h1>Committee</h1>')
    await write('committee.txt', '"src":"/media/hidden-coordinator.png"')
    await write('style.css', '.hero { background: url("/media/hero.jpg") }')
    await expect(verifyStaticMedia(output)).rejects.toThrow('/media/hidden-coordinator.png')
    await write('media/hidden-coordinator.png', 'portrait')
    await expect(verifyStaticMedia(output)).rejects.toThrow('/media/hero.jpg')
  })

  it('rejects Blob URLs and runtime image endpoints in the export', async () => {
    await write(
      'index.html',
      '<img src="https://store.public.blob.vercel-storage.com/photo.jpg"><img src="/_next/image?url=test">',
    )
    await expect(verifyStaticMedia(output)).rejects.toThrow('still references Vercel Blob')
    await write('index.html', '<img src="/api/media/file/photo.jpg">')
    await expect(verifyStaticMedia(output)).rejects.toThrow('runtime image endpoint')
  })

  it('resolves relative media paths from generated stylesheets', async () => {
    await write('index.html', '<h1>Home</h1>')
    await mkdir(path.join(output, '_next/static/chunks'))
    await write('_next/static/chunks/style.css', '@font-face { src: url(../media/font.woff2) }')
    await write('_next/static/media/font.woff2', 'font')
    await expect(verifyStaticMedia(output)).resolves.toEqual({ pages: 1, assets: 1 })
  })

  it('rejects empty assets and an output directory without any pages', async () => {
    await expect(verifyStaticMedia(output)).rejects.toThrow('No exported HTML pages')
    await write('index.html', '<img src="/media/empty.jpg">')
    await write('media/empty.jpg', '')
    await expect(verifyStaticMedia(output)).rejects.toThrow(
      'missing or empty media file /media/empty.jpg',
    )
  })

  it('checks public image files outside the CMS media directory', async () => {
    await write('index.html', '<img src="/logo.svg"><img src="data:image/png;base64,test">')
    await expect(verifyStaticMedia(output)).rejects.toThrow('missing or empty media file /logo.svg')
    await write('logo.svg', '<svg/>')
    await expect(verifyStaticMedia(output)).resolves.toEqual({ pages: 1, assets: 1 })
  })

  it('reassembles URLs split across streamed React payload chunks', async () => {
    const chunks = ['{"src":"/media/por', 'trait.png"}']
    await write(
      'index.html',
      chunks
        .map((chunk) => `<script>self.__next_f.push(${JSON.stringify([1, chunk])})</script>`)
        .join(''),
    )
    await expect(verifyStaticMedia(output)).rejects.toThrow(
      'missing or empty media file /media/portrait.png',
    )
    await write('media/portrait.png', 'portrait')
    await expect(verifyStaticMedia(output)).resolves.toEqual({ pages: 1, assets: 1 })
  })
})
