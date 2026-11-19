import { describe, expect, it } from 'vitest'
import {
  formatDuration,
  formatTime,
  groupNames,
  toSpans,
  totalSeconds,
  type Step,
} from '../pipeline'

const steps: Step[] = [
  { name: 'Install', group: 'Set up', startSecond: 0, endSecond: 5 },
  { name: 'Lint', group: 'Code', startSecond: 5, endSecond: 19 },
  { name: 'Checkout', group: 'Set up', startSecond: 5, endSecond: 6 },
  { name: 'Knip', group: 'Code', startSecond: 19, endSecond: 19 },
]

describe('groupNames', () => {
  it('lists each group once, in first-seen order', () => {
    expect(groupNames(steps)).toStrictEqual(['Set up', 'Code'])
  })
})

describe('toSpans', () => {
  it('nests each step in a span for its group, in milliseconds', () => {
    expect(toSpans(steps)).toStrictEqual([
      {
        value: 'Set up',
        label: 'Set up',
        start: 0,
        duration: 6000,
        children: [
          { value: 'Set up/Install', label: 'Install', start: 0, duration: 5000 },
          { value: 'Set up/Checkout', label: 'Checkout', start: 5000, duration: 1000 },
        ],
      },
      {
        value: 'Code',
        label: 'Code',
        start: 5000,
        duration: 14_000,
        children: [
          { value: 'Code/Lint', label: 'Lint', start: 5000, duration: 14_000 },
          { value: 'Code/Knip', label: 'Knip', start: 19_000, duration: 0 },
        ],
      },
    ])
  })

  it('gives no spans for no steps', () => {
    expect(toSpans([])).toStrictEqual([])
  })
})

describe('totalSeconds', () => {
  it('is the latest end', () => {
    expect(totalSeconds(steps)).toBe(19)
  })

  it('is zero for no steps', () => {
    expect(totalSeconds([])).toBe(0)
  })
})

describe('formatTime', () => {
  it('shows zero as 0 s', () => {
    expect(formatTime(0)).toBe('0 s')
  })

  it('rounds to whole seconds', () => {
    expect(formatTime(49_600)).toBe('50 s')
  })
})

describe('formatDuration', () => {
  it('rounds to whole seconds', () => {
    expect(formatDuration(14_400)).toBe('14 s')
  })

  it('shows less than a second for a short step', () => {
    expect(formatDuration(0)).toBe('<1 s')
  })
})
