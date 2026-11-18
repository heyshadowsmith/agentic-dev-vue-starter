import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { defineConfig } from 'lint-staged/config'

const maxMarkdownFixPasses = 10
const vendoredMarkdownFolder = '.claude/skills/'

const runBin = (bin: string, commandArguments: readonly string[]) =>
  spawnSync(path.resolve(import.meta.dirname, 'node_modules/.bin', bin), commandArguments, {
    encoding: 'utf8',
  })

const isMarkdownClean = (files: readonly string[]): boolean =>
  runBin('markdownlint-cli2', ['--no-globs', '--fix', ...files]).status === 0

const isOwnMarkdown = (file: string): boolean =>
  !path.relative(import.meta.dirname, file).startsWith(vendoredMarkdownFolder)

type Log = (...messages: unknown[]) => void

const fixMarkdown = (files: readonly string[], log: Log) => {
  const passes = Array.from({ length: maxMarkdownFixPasses }, () => files)
  if (passes.some((batch) => isMarkdownClean(batch))) return
  const report = runBin('markdownlint-cli2', ['--no-globs', ...files])
  log(report.stdout, report.stderr)
  throw new Error('markdownlint found problems it could not fix')
}

const checkProse = (files: readonly string[], log: Log) => {
  const ownFiles = files.filter((file) => isOwnMarkdown(file))
  if (ownFiles.length === 0) return
  const report = runBin('ste-lint', ['--max-warnings', '0', ...ownFiles])
  if (report.status === 0) return
  log(report.stdout, report.stderr)
  throw new Error('ste-lint found prose that does not follow ASD-STE100')
}

export default defineConfig({
  '*.{ts,mts,tsx,vue}': ['oxlint --fix', 'eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{css,json,yml,yaml,html}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '{package.json,pnpm-lock.yaml}': () => ['pnpm check:audit', 'pnpm check:dedupe'],
  '*.md': {
    title: 'markdownlint --fix, prettier --write, then ste-lint',
    task: (files, { log }) => {
      fixMarkdown(files, log)
      runBin('prettier', ['--write', ...files])
      checkProse(files, log)
    },
  },
})
