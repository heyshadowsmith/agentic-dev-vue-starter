export interface Step {
  readonly name: string
  readonly group: string
  readonly startSecond: number
  readonly endSecond: number
}

export interface Span {
  readonly value: string
  readonly label: string
  readonly start: number
  readonly duration: number
  readonly children?: readonly Span[]
}

const millisecondsPerSecond = 1000

const stepSpan = (step: Step): Span => ({
  value: `${step.group}/${step.name}`,
  label: step.name,
  start: step.startSecond * millisecondsPerSecond,
  duration: (step.endSecond - step.startSecond) * millisecondsPerSecond,
})

const groupSpan = (group: string, steps: readonly Step[]): Span => {
  const members = steps.filter((step) => step.group === group)
  const start = Math.min(...members.map((step) => step.startSecond))
  const end = Math.max(...members.map((step) => step.endSecond))
  return {
    value: group,
    label: group,
    start: start * millisecondsPerSecond,
    duration: (end - start) * millisecondsPerSecond,
    children: members.map((step) => stepSpan(step)),
  }
}

export const groupNames = (steps: readonly Step[]): readonly string[] =>
  steps.map((step) => step.group).filter((group, index, groups) => groups.indexOf(group) === index)

export const toSpans = (steps: readonly Step[]): readonly Span[] =>
  groupNames(steps).map((group) => groupSpan(group, steps))

export const totalSeconds = (steps: readonly Step[]): number =>
  steps.length === 0 ? 0 : Math.max(...steps.map((step) => step.endSecond))

export const formatTime = (milliseconds: number): string =>
  `${String(Math.round(milliseconds / millisecondsPerSecond))} s`

export const formatDuration = (milliseconds: number): string =>
  milliseconds < millisecondsPerSecond ? '<1 s' : formatTime(milliseconds)
