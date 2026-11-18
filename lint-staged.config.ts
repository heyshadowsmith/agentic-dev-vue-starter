import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { defineConfig } from 'lint-staged/config'

const maxMarkdownFixPasses = 10

const runBin = (bin: string, commandArguments: readonly string[]) =>
  spawnSync(path.resolve(import.meta.dirname, 'node_modules/.bin', bin), commandArguments, {
    encoding: 'utf8',
  })

const isMarkdownClean = (files: readonly string[]): boolean =>
  runBin('markdownlint-cli2', ['--no-globs', '--fix', ...files]).status === 0

export default defineConfig({
  '*.{ts,mts,tsx,vue}': ['oxlint --fix', 'eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{css,json,yml,yaml,html}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.md': {
    title: 'markdownlint --fix, then prettier --write',
    task: (files, { log }) => {
      const passes = Array.from({ length: maxMarkdownFixPasses }, () => files)
      if (passes.every((batch) => !isMarkdownClean(batch))) {
        const report = runBin('markdownlint-cli2', ['--no-globs', ...files])
        log(report.stdout, report.stderr)
        throw new Error('markdownlint found problems it could not fix')
      }
      runBin('prettier', ['--write', ...files])
    },
  },
})
