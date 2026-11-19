import type { Step } from '@/core/pipeline'

export const ciRun = {
  number: 35,
  date: '19 Nov 2026',
  url: 'https://github.com/heyshadowsmith/agentic-dev-vue-starter/actions/runs/44444639089',
}

export const ciSteps: readonly Step[] = [
  { group: 'Set up', name: 'Set up job', startSecond: 0, endSecond: 1 },
  { group: 'Set up', name: 'Check out', startSecond: 1, endSecond: 2 },
  { group: 'Set up', name: 'Set up pnpm', startSecond: 2, endSecond: 11 },
  { group: 'Set up', name: 'Set up Node', startSecond: 11, endSecond: 14 },
  { group: 'Set up', name: 'Install', startSecond: 14, endSecond: 19 },
  { group: 'Supply chain', name: 'Audit', startSecond: 19, endSecond: 21 },
  { group: 'Supply chain', name: 'Dedupe', startSecond: 21, endSecond: 33 },
  { group: 'Supply chain', name: 'Secrets', startSecond: 33, endSecond: 33 },
  { group: 'Style', name: 'Format', startSecond: 33, endSecond: 35 },
  { group: 'Style', name: 'Markdown', startSecond: 35, endSecond: 36 },
  { group: 'Style', name: 'Prose', startSecond: 36, endSecond: 36 },
  { group: 'Code', name: 'Lint', startSecond: 36, endSecond: 50 },
  { group: 'Code', name: 'Architecture', startSecond: 50, endSecond: 50 },
  { group: 'Code', name: 'Dead code', startSecond: 50, endSecond: 52 },
  { group: 'Build and test', name: 'Type check and build', startSecond: 52, endSecond: 59 },
  { group: 'Build and test', name: 'Tests and coverage', startSecond: 59, endSecond: 62 },
]
