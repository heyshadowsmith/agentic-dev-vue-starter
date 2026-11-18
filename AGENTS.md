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
