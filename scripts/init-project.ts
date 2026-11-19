import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = path.resolve(import.meta.dirname, '..')
const at = (file: string) => path.join(root, file)
const starterUrl = 'https://github.com/heyshadowsmith/agentic-dev-vue-starter'
const validName = /^[a-z\d][\w.-]*$/

const showcaseFiles = [
  'src/home',
  'src/components/home',
  'src/core/checks.ts',
  'src/core/pipeline.ts',
  'src/core/prompt.ts',
  'src/core/tree.ts',
  'src/core/repository.ts',
  'src/core/result.ts',
  'src/core/__tests__',
  'src/adapters',
  'src/ports',
  'src/__tests__/fakes.ts',
  'src/__tests__/repository-status.spec.ts',
  'src/stores/prompt.ts',
  'src/lib/clipboard.ts',
  'src/lib/sections.ts',
  '.github/workflows/template.yml',
  'scripts/init-project.ts',
]

const showcaseDependencies = ['valibot']

const option = (name: string): string | undefined => {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

const toTitle = (name: string): string =>
  name
    .split(/[._-]+/)
    .filter((word) => word !== '')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const homeView = (name: string, title: string) => `<script setup lang="ts">
import ColorSchemeControl from '@/components/ColorSchemeControl.vue'
</script>

<template>
  <header class="border-b border-(--ui-foreground)">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
      <span class="font-bold">${name}<span class="text-(--accent)">_</span></span>
      <ColorSchemeControl />
    </div>
  </header>
  <main class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-14">
    <h1 class="text-3xl font-bold tracking-tight sm:text-5xl">${title}</h1>
    <p class="max-w-2xl text-(--ui-muted-foreground)">
      Start here. Agents read AGENTS.md before they change code.
    </p>
  </main>
</template>
`

const homeSpec = (title: string) => `import { describe, expect, it } from 'vitest'
import { mountApp } from './mount-app'

describe('home page', () => {
  it('shows the project name', async () => {
    const wrapper = await mountApp()
    expect(wrapper.get('h1').text()).toBe('${title}')
  })

  it('sends an unknown path to the home page', async () => {
    const wrapper = await mountApp('/missing')
    expect(wrapper.find('h1').exists()).toBe(true)
  })
})
`

const agentSpec = `import { describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createAgent } from '@ui-sdk/vue/agent'
import { mountApp } from './mount-app'

const agent = createAgent()

describe('agent access', () => {
  it('gives every control a name', async () => {
    await mountApp()
    const labels = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== 'more')
      .map((entry) => entry.label)
    expect(labels.filter((label) => !label), 'unnamed components').toStrictEqual([])
    expect(labels).toContain('Color scheme')
  })

  it('switches the color scheme', async () => {
    await mountApp()
    const result = await agent.act({
      steps: [{ ref: 'Color scheme', action: 'setValue', args: ['dark'] }],
    })
    await flushPromises()
    expect(result.ok, result.error?.message).toBe(true)
    expect(document.documentElement.dataset['colorScheme']).toBe('dark')
  })
})
`

const readme = (title: string) => `# ${title}

This project starts from [Agentic Dev Vue Starter](${starterUrl}).

## Start

Run these commands:

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Rules

Read \`AGENTS.md\` before you change code.
Each rule is a check that runs on each commit and again in CI.
`

const updatePackage = (name: string) => {
  const manifest = JSON.parse(readFileSync(at('package.json'), 'utf8')) as {
    name: string
    scripts: Record<string, string>
  }
  const scripts = Object.fromEntries(
    Object.entries(manifest.scripts).filter(([script]) => script !== 'init-project'),
  )
  writeFileSync(at('package.json'), `${JSON.stringify({ ...manifest, name, scripts }, null, 2)}\n`)
}

const updateTitle = (title: string) => {
  const html = readFileSync(at('index.html'), 'utf8')
  writeFileSync(
    at('index.html'),
    html.replace(/<title>.*<\/title>/, () => `<title>${title}</title>`),
  )
}

const mainScript = `import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
`

const removeShowcaseDependencies = () => {
  const pnpm = process.env['npm_execpath']
  if (pnpm === undefined) {
    console.log(`Run "pnpm remove ${showcaseDependencies.join(' ')}" to finish.`)
    return
  }
  spawnSync(process.execPath, [pnpm, 'remove', ...showcaseDependencies], {
    cwd: root,
    stdio: 'inherit',
  })
}

const generated = (name: string, title: string): readonly [string, string][] => [
  ['src/main.ts', mainScript],
  ['src/views/HomeView.vue', homeView(name, title)],
  ['src/__tests__/home.spec.ts', homeSpec(title)],
  ['src/__tests__/agent.spec.ts', agentSpec],
  ['README.md', readme(title)],
]

const setUp = (name: string, title: string) => {
  for (const file of showcaseFiles) rmSync(at(file), { recursive: true, force: true })
  for (const [file, content] of generated(name, title)) writeFileSync(at(file), content)
  updatePackage(name)
  updateTitle(title)
  removeShowcaseDependencies()
  const files = ['package.json', 'index.html', ...generated(name, title).map(([file]) => file)]
  spawnSync(at('node_modules/.bin/prettier'), ['--write', ...files.map((file) => at(file))], {
    stdio: 'inherit',
  })
  console.log(`\n${title} is ready. Review the changes with "git status", then commit them.`)
  console.log('To undo them, run "git restore .".')
}

const name = option('--name') ?? path.basename(root).toLowerCase()
const title = toTitle(name)
const problem = [
  !validName.test(name) || title === ''
    ? `"${name}" is not a valid package name. Pass one with --name, for example --name my-app.`
    : undefined,
  existsSync(at('src/home'))
    ? undefined
    : 'The showcase is already gone. This project was set up before.',
].find((message) => message !== undefined)

if (problem === undefined) {
  setUp(name, title)
} else {
  console.error(problem)
  process.exitCode = 1
}
