import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

interface HookInput {
  readonly tool_input?: { readonly file_path?: unknown }
}

type Check = readonly [bin: string, commandArguments: readonly string[]]

const root = path.resolve(import.meta.dirname, '..')
const skippedFolders = ['node_modules/', 'dist/', 'coverage/', '.claude/skills/']
const codeFile = /\.(?:ts|mts|tsx|vue)$/
const configFile = /\.(?:css|json|ya?ml|html)$/

const readEditedFile = (): string | undefined => {
  try {
    const input = JSON.parse(readFileSync(0, 'utf8')) as HookInput
    const file = input.tool_input?.file_path
    return typeof file === 'string' ? file : undefined
  } catch {
    return undefined
  }
}

const isProjectFile = (relative: string): boolean =>
  relative !== '' &&
  !relative.startsWith('..') &&
  !path.isAbsolute(relative) &&
  skippedFolders.every((folder) => !relative.startsWith(folder))

const checksFor = (file: string): readonly Check[] => {
  const eslint: Check = ['eslint', ['--no-warn-ignored', file]]
  if (codeFile.test(file)) return [['oxlint', [file]], eslint]
  if (configFile.test(file)) return [eslint]
  if (file.endsWith('.md')) {
    return [
      ['markdownlint-cli2', ['--no-globs', file]],
      ['ste-lint', ['--max-warnings', '0', file]],
    ]
  }
  return []
}

const runCheck = ([bin, commandArguments]: Check): string | undefined => {
  const result = spawnSync(path.join(root, 'node_modules/.bin', bin), commandArguments, {
    cwd: root,
    encoding: 'utf8',
  })
  return result.status === 0 ? undefined : `${bin}:\n${result.stdout}${result.stderr}`.trim()
}

const file = readEditedFile()
const relative = file === undefined ? '' : path.relative(root, path.resolve(root, file))

if (isProjectFile(relative)) {
  const failures = checksFor(relative)
    .map((check) => runCheck(check))
    .filter((failure) => failure !== undefined)
  if (failures.length > 0) {
    process.stderr.write(
      `The checks found problems in ${relative}. Fix them before you continue.\n\n${failures.join('\n\n')}\n`,
    )
    process.exitCode = 2
  }
}
