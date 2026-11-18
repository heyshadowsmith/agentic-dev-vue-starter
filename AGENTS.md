# Agent Notes

## ui-sdk

Before using ui-sdk, follow the `ui-sdk` skill if it's installed, and read `node_modules/@ui-sdk/vue/docs/llms.txt`.

To build a new component, also search `node_modules/@ui-sdk/vue/docs/core.md` by heading, and read `node_modules/@ui-sdk/vue/docs/rendering.md` next to it.

## Commits

Commit messages are a Conventional Commits title only, with no scope, body or trailers, such as `feat: add login form`.

## Functional Core, Imperative Shell

Put pure logic in `src/core/`. Everything else in `src/` is the shell: components, stores, the router and `main.ts`. The shell may import the core; the core may only import other core files, using `./` or `@/core/` paths.

Core code is synchronous and pure: no Vue, Pinia, router, ui-sdk or npm imports, no browser or timer globals, no `Date.now()`, `new Date()` or `Math.random()`, no `let`, mutation, loops, classes, `throw` or `try`, and no functions that take no parameters or return nothing. Pass time, randomness and data in from the shell. Components never go in `src/core/`. Tests under `src/core/` are exempt from these style rules.

Core code needs 100% test coverage for lines, branches, functions and statements. Run `pnpm test:coverage` to check; CI runs it too. The shell isn't measured.

## TypeScript

Every tsconfig extends `tsconfig.strict.json`, which adds checks beyond `strict`, such as `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` and `erasableSyntaxOnly`, which bans enums and namespaces. Change strictness there, not in the individual tsconfigs.

With `exactOptionalPropertyTypes`, an optional prop like `title?: string` can be left out but can't be passed `undefined`. If `undefined` is a valid value, declare it as `title?: string | undefined`.

## Architecture

`pnpm check:architecture` runs [archlint](https://github.com/archlinter/archlint) with `.archlint.yaml`, and CI fails on any finding: cycles, layer violations (`src/core/` may only import `src/core/`), complexity over 15, nesting deeper than 4, long parameter lists, large files, god modules, barrel files, code clones and side-effect imports.

archlint can't read `.vue` files, so imports made only from components are invisible to it. Its dead-code detectors are off for that reason; Knip covers dead code instead. When you add a path alias to `tsconfig.app.json`, add it to `aliases` in `.archlint.yaml` too, because archlint doesn't read aliases from this tsconfig setup.

## Dead code

`pnpm check:dead-code` runs [Knip](https://knip.dev), and CI fails on any unused file, export, dependency or type. Knip reads `.vue` files, so code used only by components counts as used. Delete dead code rather than ignoring it.

`knip.json` ignores `@ui-sdk/vue` only because no component uses it yet. Once one does, Knip fails until that entry is removed, so an ignore can't outlive its reason.
