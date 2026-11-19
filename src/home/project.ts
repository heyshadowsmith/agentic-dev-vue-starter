export type Layer = 'core' | 'shell' | 'config' | 'docs'

export interface ProjectNode {
  value: string
  label: string
  layer: Layer
  note: string
  children?: ProjectNode[]
}

export const layerNames: Readonly<Record<Layer, string>> = {
  core: 'Functional core',
  shell: 'Imperative shell',
  config: 'Tooling',
  docs: 'Documentation',
}

export const projectTree: ProjectNode[] = [
  {
    value: 'src',
    label: 'src/',
    layer: 'shell',
    note: 'The app. Everything here is the shell, except src/core.',
    children: [
      {
        value: 'src/core',
        label: 'core/',
        layer: 'core',
        note: 'Pure, synchronous logic. No Vue, no browser, no time, no mutation. 100% test coverage.',
        children: [
          {
            value: 'src/core/checks.ts',
            label: 'checks.ts',
            layer: 'core',
            note: 'Filters the checks on this page by text and stage.',
          },
          {
            value: 'src/core/prompt.ts',
            label: 'prompt.ts',
            layer: 'core',
            note: 'Builds the agent prompt from the form options.',
          },
          {
            value: 'src/core/pipeline.ts',
            label: 'pipeline.ts',
            layer: 'core',
            note: 'Turns CI steps into nested spans for the waterfall.',
          },
        ],
      },
      {
        value: 'src/components',
        label: 'components/',
        layer: 'shell',
        note: 'Vue components built from ui-sdk parts. They call the core and own the side effects.',
      },
      {
        value: 'src/stores',
        label: 'stores/',
        layer: 'shell',
        note: 'Pinia stores. State lives here, rules live in the core.',
      },
      {
        value: 'src/router',
        label: 'router/',
        layer: 'shell',
        note: 'Vue Router routes.',
      },
      {
        value: 'src/__tests__/setup.ts',
        label: '__tests__/setup.ts',
        layer: 'shell',
        note: 'Turns on ui-sdk strict mode and the jsdom stubs. A ui-sdk warning fails the test.',
      },
    ],
  },
  {
    value: 'eslint',
    label: 'eslint/',
    layer: 'config',
    note: 'Local rules: no comments, core purity, workflow security and v-pre text.',
  },
  {
    value: 'scripts/audit.ts',
    label: 'scripts/audit.ts',
    layer: 'config',
    note: 'Fails on known vulnerabilities that have a fix, and ignores the rest until a fix ships.',
  },
  {
    value: 'lint-staged.config.ts',
    label: 'lint-staged.config.ts',
    layer: 'config',
    note: 'What runs on each commit, and on which files.',
  },
  {
    value: 'AGENTS.md',
    label: 'AGENTS.md',
    layer: 'docs',
    note: 'The rules an agent reads first. The only place for explanations, in Simplified Technical English.',
  },
]
