export interface Variable {
  readonly name: string
  readonly defaultValue: string
}

export type VariableValues = Readonly<Record<string, string>>

const variablePattern = /\{\{\s*([\w-]+)\s*(?:\|([^{}]*))?\}\}/g

const mergeVariable = (found: readonly Variable[], next: Variable): readonly Variable[] => {
  const existing = found.find((variable) => variable.name === next.name)
  if (existing === undefined) return [...found, next]
  if (existing.defaultValue !== '') return found
  return found.map((variable) => (variable.name === next.name ? next : variable))
}

export const parseVariables = (body: string): readonly Variable[] =>
  [...body.matchAll(variablePattern)]
    .map((match) => ({
      name: match[1] as string,
      defaultValue: (match[2] ?? '').trim(),
    }))
    .reduce(mergeVariable, [])

export const defaultValues = (variables: readonly Variable[]): VariableValues =>
  Object.fromEntries(variables.map((variable) => [variable.name, variable.defaultValue]))

export const fillTemplate = (body: string, values: VariableValues): string => {
  const defaults = defaultValues(parseVariables(body))
  return body.replaceAll(
    variablePattern,
    (_match, name: string) => values[name] ?? (defaults[name] as string),
  )
}
