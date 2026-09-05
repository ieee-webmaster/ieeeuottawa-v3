// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { expect, it } from 'vitest'

it('checks staged formatting without changing the index or working files', async () => {
  const root = process.cwd()
  const fixture = await mkdtemp(path.join(os.tmpdir(), 'staged-format-'))
  const git = (...args: string[]) => execFileSync('git', args, { cwd: fixture, encoding: 'utf8' })
  const runHook = () =>
    spawnSync(path.join(root, '.githooks/pre-commit'), {
      cwd: fixture,
      encoding: 'utf8',
    })

  try {
    git('init', '--quiet')
    await mkdir(path.join(fixture, 'scripts'))
    await copyFile(
      path.join(root, 'scripts/check-staged-format.ts'),
      path.join(fixture, 'scripts/check-staged-format.ts'),
    )
    await symlink(path.join(root, 'node_modules'), path.join(fixture, 'node_modules'))
    await writeFile(path.join(fixture, 'package.json'), '{"type":"module"}\n')
    await writeFile(path.join(fixture, '.prettierrc.json'), '{"semi":false}\n')
    await writeFile(path.join(fixture, '.prettierignore'), 'ignored.ts\n')
    await writeFile(path.join(fixture, '.gitignore'), 'private.ts\n')
    const filename = 'space and\nnewline.ts'
    const file = path.join(fixture, filename)
    const formatted = 'const value = 1\n'
    const unformatted = 'const value=1;\n'

    await writeFile(file, unformatted)
    git('add', '--', filename)
    await writeFile(file, formatted)
    const rejected = runHook()
    expect(rejected.status, rejected.stderr).toBe(1)
    expect(rejected.stderr).toContain(JSON.stringify(filename))
    expect(git('show', `:${filename}`)).toBe(unformatted)
    expect(await readFile(file, 'utf8')).toBe(formatted)

    git('add', '--', filename)
    await writeFile(file, unformatted)
    for (const name of ['ignored.ts', 'private.ts', 'image.bin']) {
      await writeFile(path.join(fixture, name), 'Unformatted ignored content')
      git('add', '--force', '--', name)
    }
    const accepted = runHook()
    expect(accepted.status, accepted.stderr).toBe(0)
    expect(accepted.stdout + accepted.stderr).not.toContain('Unformatted ignored content')
    expect(git('show', `:${filename}`)).toBe(formatted)
    expect(await readFile(file, 'utf8')).toBe(unformatted)
  } finally {
    await rm(fixture, { recursive: true, force: true })
  }
})
