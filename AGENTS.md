# Agent Notes

## ui-sdk

Before you use ui-sdk, follow the `ui-sdk` skill if it is installed.
Also read `node_modules/@ui-sdk/vue/docs/llms.txt`.

To build a new component, also search `node_modules/@ui-sdk/vue/docs/core.md` by heading.
Then read `node_modules/@ui-sdk/vue/docs/rendering.md`, which is in the same folder.

## Commits

A commit message is a Conventional Commits title only, for example `feat: add login form`.
Do not write a scope, a body or trailers.

On each commit, lint-staged fixes and checks the staged files.
It uses Oxlint, ESLint, markdownlint, ste-lint and Prettier, as `lint-staged.config.ts` shows.
Then Secretlint scans the staged files.
A commit fails if a tool cannot fix a problem automatically.

CI runs all checks again.
It also runs the checks that lint-staged does not run: the type check, the tests, archlint and Knip.

## Functional Core, Imperative Shell

Put pure logic in `src/core/`.
All other code in `src/` is the shell: components, stores, the router and `main.ts`.
The shell can import the core.
The core can import only other core files, with `./` or `@/core/` paths.

Core code is synchronous and pure.
It cannot contain these items:

- Imports of Vue, Pinia, the router, ui-sdk or npm packages
- Browser globals or timer globals
- `Date.now()`, `new Date()` or `Math.random()`
- `let`, mutation, loops or classes
- `throw` or `try`
- Functions with no parameters, or functions that give no value

Use `map`, `filter` and `reduce` in the core, because loops are not permitted there.
Give time, random values and data to the core from the shell.
Do not put components in `src/core/`.
These style rules do not apply to tests in `src/core/`.

Core code must have 100% test coverage for lines, branches, functions and statements.
Run `pnpm test:coverage` to check the coverage.
CI also runs it.
The tool does not measure the shell.

## Tests

A test must contain an assertion, and each `expect` must be in a test.
Oxlint finds a test without an assertion, a conditional `expect` and an `expect` without a matcher.
ESLint finds `if`, `switch` and the conditional operator in a test.
Write one test for each case.
Use `toStrictEqual`, not `toEqual`, because `toEqual` ignores `undefined` properties and class types.

`src/__tests__/setup.ts` turns on the ui-sdk strict mode, adds the jsdom stubs that ui-sdk needs and unmounts each component after its test.
A development warning from ui-sdk makes the test fail.
Only this file can assign to globals and contain empty functions.
The 60-line function limit does not apply to test files.
The unicorn rule `no-top-level-assignment-in-function` is off in test files.
An `expect` can have a message as its second argument, for example `expect(result.ok, result.error).toBe(true)`.

## TypeScript

Each tsconfig extends `tsconfig.strict.json`.
That file adds checks to `strict`, for example `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`.
It also adds `erasableSyntaxOnly`, which prevents enums and namespaces.
Change the strictness in `tsconfig.strict.json`, not in the other tsconfig files.

With `exactOptionalPropertyTypes`, you can omit an optional prop like `title?: string`.
But you cannot give it the value `undefined`.
If `undefined` is a correct value, declare the prop as `title?: string | undefined`.

The app and the tests use the ES2022 library, because the build supports browsers that do not have ES2023.
Thus some unicorn rules are off, because they ask for `toSorted`, `toReversed` or newer methods.
Copy an array before you sort or reverse it, for example `[...items].sort()`.

ESLint uses the `unopinionated` preset of `eslint-plugin-unicorn`, which does not enforce a personal style.
`eslint.config.ts` also turns on each rule of the `recommended` preset that unicorn marks as a problem.
Thus unicorn finds bugs, for example a mismatched `Map` key, but it does not ask you to rename variables.

`tsconfig.strict.json` also turns on `strictTemplates` for `vue-tsc`.
The type check fails on unknown components, props, events and directives in templates.
Templates can use `data-*` attributes on HTML elements, for example `data-testid`.

Do not use the non-null assertion `!`, because ESLint does not permit it.
If a value cannot be `undefined`, use `as` with the type, or check the value first.
A template string can contain numbers, but not booleans, arrays or values that can be `undefined`.

## Accessibility

ESLint examines Vue templates with the recommended rules of `eslint-plugin-vuejs-accessibility`.
For example, it finds images without `alt`, form controls without a label and click handlers on elements that a keyboard cannot use.
A label can contain its control, or it can refer to the `id` of the control with `for`.
The rules cannot find a `for` that refers to an `id` that does not exist.

The rules know the ui-sdk form controls, for example `Select`, `Checkbox` and `DatePicker`.
Put a ui-sdk control in a `Field` with a `FieldLabel`, or put it in a `<label>`.
Do not rename a ui-sdk import to get past an accessibility rule.

## Architecture

`pnpm check:architecture` runs [archlint](https://github.com/archlinter/archlint) with `.archlint.yaml`.
CI fails if archlint finds one of these problems:

- Cycles
- Layer violations, because `src/core/` can import only `src/core/`
- Complexity of more than 15, or nesting of more than 4 levels
- Long parameter lists or large files
- God modules, barrel files, code clones or side-effect imports

archlint cannot read `.vue` files.
Thus it does not see imports that only components make.
For this reason, its dead-code detectors are off, and Knip finds dead code.

archlint does not read aliases from this tsconfig setup.
When you add a path alias to `tsconfig.app.json`, also add it to `aliases` in `.archlint.yaml`.

## Workflows

ESLint examines the GitHub Actions workflows in `.github/workflows/`.
It runs the official actionlint through `eslint-plugin-actionlint`.
The plugin downloads actionlint from GitHub Releases on the first run, and it verifies the checksum.
`eslint/workflows.ts` adds these security rules:

- Pin each `uses` to a full 40-character commit SHA.
- Do not put `${{ }}` expressions in `run` scripts, and give the value to the script with `env`.
- Set `persist-credentials: false` on each `actions/checkout` step.
- Declare top-level `permissions` in each workflow.
- Do not use the `pull_request_target` trigger.

CI also runs zizmor, which does more security audits than the local rules.
Comments are not permitted in YAML, thus a pinned SHA does not show its version.
To find the version, look up the SHA on GitHub.

## Dead code

`pnpm check:dead-code` runs [Knip](https://knip.dev).
CI fails if Knip finds an unused file, export, dependency or type.
Knip reads `.vue` files, thus it knows the code that only components use.
Delete dead code.
Do not tell Knip to ignore it.

`knip.json` ignores `@ui-sdk/vue` only because no component uses it at this time.
When a component uses it, Knip fails until you remove that entry.
Thus an ignore entry cannot stay after its reason is gone.

## Markdown

Markdown is the only place for comments and explanations.
Write one sentence on each line, because this keeps the diffs small.
The `markdownlint-sentences-per-line` rule checks this, and lint-staged divides the lines for you on commit.

`pnpm check:markdown` runs markdownlint-cli2 with `.markdownlint-cli2.yaml`.
It uses the markdownlint style that agrees with Prettier.
CI fails if markdownlint finds a problem.
Inline `markdownlint-disable` comments have no effect.
markdownlint does not examine the vendored skill files in `.claude/skills/`.

## Prose

Write Markdown prose in ASD-STE100 Simplified Technical English (STE).
`pnpm check:prose` runs [ste-lint](https://github.com/mark1russell7/ste-lint) with `ste.config.json`.
CI and lint-staged fail on each error and each warning.

These are the most frequent rules:

- An instruction has a maximum of 20 words, and a description has a maximum of 25 words.
- A paragraph has a maximum of 6 sentences.
- Do not use semicolons, `-ing` verbs, Latin abbreviations or the modal verbs `should` and `may`.
- Write "for example", not "such as", and "do not", not "never".

The tool does not use the STE dictionary, because that dictionary is copyrighted.
Thus it does not find words that STE does not approve.
`ste.config.json` adds `run` as a technical verb, because it is a usual term in software.

## Dependencies

`pnpm check:audit` runs `scripts/audit.ts`.
The script finds each known vulnerability that has a fixed version.
It ignores a vulnerability without a fix, and it examines that vulnerability again on each run.
When a fix becomes available, the check fails until you update the dependency.

The check runs at these times:

- After each `pnpm install` or `pnpm add`, as a warning only
- On each commit that changes `package.json` or `pnpm-lock.yaml`, and it stops the commit
- In CI, and it stops the merge

`pnpm-workspace.yaml` sets `minimumReleaseAge` to 1440 minutes.
pnpm does not install a package version that is less than 24 hours old.
If this setting stops an install, stop and ask the user.
Do not add the package to `minimumReleaseAgeExclude`.

`pnpm-workspace.yaml` also sets `strictDepBuilds`.
An install fails if a dependency has an install script that nobody approved.
Examine the script before you approve it.

`pnpm check:dedupe` runs `pnpm dedupe --check`.
It fails if `pnpm dedupe` can remove a duplicate version from `pnpm-lock.yaml`.
It also fails if the lock file contains a version that is less than 24 hours old.
Run `pnpm dedupe` to correct the lock file.
CI runs this check, and lint-staged runs it when `package.json` or `pnpm-lock.yaml` changes.

`pnpm.overrides` in `package.json` forces fixed versions of five transitive dependencies.
Remove an override when its parent package uses a fixed version.

Do not use `pnpm audit --ignore-unfixable`.
It writes `pnpm.auditConfig` to `package.json`, and that entry ignores the vulnerability permanently.
Also, its idea of "unfixable" is different, and it ignored a vulnerability with a fix in this project.
