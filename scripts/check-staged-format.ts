import { execFileSync } from 'node:child_process'
import { check, getFileInfo, resolveConfig } from 'prettier'

const files = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], {
  encoding: 'utf8',
})
  .split('\0')
  .filter(Boolean)

for (const file of files) {
  const info = await getFileInfo(file, { ignorePath: ['.gitignore', '.prettierignore'] })
  if (info.ignored || !info.inferredParser) continue

  const source = execFileSync('git', ['show', `:${file}`], { encoding: 'utf8' })
  const options = await resolveConfig(file, { editorconfig: true })
  if (!(await check(source, { ...options, filepath: file }))) {
    console.error(`Prettier: format and stage ${JSON.stringify(file)} before committing.`)
    process.exitCode = 1
  }
}
