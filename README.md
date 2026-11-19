# Agentic Dev Vue Starter

A strict Vue starter for coding agents.
Each project rule is a check that runs on each commit and again in CI.
`AGENTS.md` lists the rules.

## Start a project

1. On GitHub, select **Use this template** and make your repository.
2. Clone your repository, then run these commands:

   ```bash
   pnpm install
   pnpm init-project --name my-app
   pnpm dev
   ```

3. Review the changes, then commit them.

`pnpm init-project` removes the showcase home page and its data.
It writes a minimal home page and its tests, and it puts your project name in `package.json`, `index.html` and this file.
Then the script removes itself.
To undo the changes before you commit, run `git restore .`.

## Settings that a template does not copy

GitHub does not copy these settings to your repository:

- Branch protection or rulesets for `main`
- Status checks that are necessary for a merge, for example the Checks job of the CI workflow
- Connected apps, for example Vercel

## Change the showcase

The showcase is the home page of this repository.
`scripts/init-project.ts` lists the showcase files that it removes.
When you add a showcase file, add it to that list.
The Template workflow runs the script on each pull request and then runs the checks.
If the list is not complete, Knip finds the unused file and the workflow fails.
