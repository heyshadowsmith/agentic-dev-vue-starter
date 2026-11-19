import type { Check } from '@/core/checks'

export const checks: readonly Check[] = [
  {
    id: 'core-purity',
    tool: 'ESLint',
    stage: 'commit',
    catches: 'Impure code in src/core',
    example:
      "src/core/stamp.ts\n  1:68  error  'Date.now' is restricted from being used. Pass the current time in from the shell  no-restricted-properties",
  },
  {
    id: 'comments',
    tool: 'ESLint',
    stage: 'commit',
    catches: 'Comments in any code file',
    example:
      'src/math.ts\n  1:1  error  Comments are not allowed. Make the code say it, or write it in a Markdown file  local/no-comments',
  },
  {
    id: 'non-null',
    tool: 'ESLint',
    stage: 'commit',
    catches: 'Non-null assertions',
    example:
      'src/list.ts\n  1:51  error  Forbidden non-null assertion  @typescript-eslint/no-non-null-assertion',
  },
  {
    id: 'strict-equal',
    tool: 'ESLint',
    stage: 'commit',
    catches: 'Loose equality in tests',
    example:
      'src/__tests__/math.spec.ts\n  3:20  error  Use `toStrictEqual()` instead  vitest/prefer-strict-equal',
  },
  {
    id: 'prose',
    tool: 'ste-lint',
    stage: 'commit',
    catches: 'Prose that is not Simplified Technical English',
    example:
      'README.md\n  3:5   error  Do not use the modal verb "should". Write "must" for an obligation, or "if" for a condition ("If X occurs, ...").  modal-verb\n  3:26  error  Do not use a semicolon. Write two sentences, or use a comma and "and" or "but". For a list of items, use a vertical list.  semicolon',
  },
  {
    id: 'commit-message',
    tool: 'commitlint',
    stage: 'commit',
    catches: 'Commit messages that are not a bare Conventional Commits title',
    example: '✖   scope must be empty [scope-empty]\n✖   body must be empty [body-empty]',
  },
  {
    id: 'types',
    tool: 'vue-tsc',
    stage: 'ci',
    catches: 'Strict types in scripts and templates',
    example:
      "src/props.ts(2,14): error TS2375: Type '{ title: undefined; }' is not assignable to type 'Props' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.",
  },
  {
    id: 'coverage',
    tool: 'Vitest',
    stage: 'ci',
    catches: 'Core coverage below 100%',
    example:
      'ERROR: Coverage for lines (97.77%) does not meet global threshold (100%)\nERROR: Coverage for functions (96.77%) does not meet global threshold (100%)',
  },
  {
    id: 'cycles',
    tool: 'archlint',
    stage: 'ci',
    catches: 'Import cycles, layer breaks and complexity',
    example:
      "🟠 HIGH  Cycle Cluster  src/b.ts:1:10 (imports from 'src/a.ts' (a))\n                        src/a.ts:1:10 (imports from 'src/b.ts' (b))",
  },
  {
    id: 'dead-code',
    tool: 'Knip',
    stage: 'ci',
    catches: 'Unused files, exports, types and dependencies',
    example: 'Unused files (1)\nsrc/legacy.ts',
  },
]
