import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { z } from 'zod'

const exec = promisify(execFile)

/** Publish the exact staged blobs with GitHub signing and a branch-head lease. */
export async function commitStagedChanges(options: {
  directory: string
  repository: string
  branch: string
  expectedHeadOid: string
  headline: string
}) {
  const names = async (filter: string) =>
    (
      await exec(
        'git',
        ['diff', '--cached', '--no-renames', '--name-only', `--diff-filter=${filter}`, '-z'],
        { cwd: options.directory },
      )
    ).stdout
      .split('\0')
      .filter(Boolean)
  const [added, deleted] = await Promise.all([names('AM'), names('D')])
  if (!added.length && !deleted.length) throw new Error('No staged changes to publish')
  const additions = await Promise.all(
    added.map(async (filename) => {
      const mode = (
        await exec('git', ['ls-files', '--stage', '--', filename], { cwd: options.directory })
      ).stdout.split(' ')[0]
      if (mode !== '100644')
        throw new Error(`Signed API publishing requires a regular non-executable file: ${filename}`)
      const result = await exec('git', ['show', `:${filename}`], {
        cwd: options.directory,
        encoding: 'buffer',
        maxBuffer: 32 * 1024 * 1024,
      })
      return { path: filename, contents: result.stdout.toString('base64') }
    }),
  )
  const body = JSON.stringify({
    query:
      'mutation($input:CreateCommitOnBranchInput!){createCommitOnBranch(input:$input){commit{oid url signature{isValid wasSignedByGitHub}}}}',
    variables: {
      input: {
        branch: { repositoryNameWithOwner: options.repository, branchName: options.branch },
        expectedHeadOid: options.expectedHeadOid,
        message: { headline: options.headline },
        fileChanges: { additions, deletions: deleted.map((filename) => ({ path: filename })) },
      },
    },
  })
  const response = await new Promise<string>((resolve, reject) => {
    const child = spawn('gh', ['api', 'graphql', '--input', '-'], {
      cwd: options.directory,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
      stdout += chunk
    })
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0
        ? resolve(stdout)
        : reject(
            new Error(`GitHub publication failed: ${stderr.split('\n')[0] || `exit ${code}`}`),
          ),
    )
    child.stdin.on('error', reject)
    child.stdin.end(body)
  })
  const parsed = z
    .object({
      data: z.object({
        createCommitOnBranch: z.object({
          commit: z.object({
            oid: z.string(),
            url: z.string(),
            signature: z.object({ isValid: z.literal(true), wasSignedByGitHub: z.literal(true) }),
          }),
        }),
      }),
    })
    .parse(JSON.parse(response))
  return parsed.data.createCommitOnBranch.commit
}
