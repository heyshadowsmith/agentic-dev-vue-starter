import type { Prompt } from './prompts'
import { normalizeTags } from './prompts'

export type Result<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string }

export interface LibraryFile {
  readonly version: 1
  readonly prompts: readonly Prompt[]
}

export interface ImportPlan {
  readonly toAdd: readonly Prompt[]
  readonly skipped: number
}

export interface RestoredLibrary {
  readonly prompts: readonly Prompt[]
  readonly damaged: boolean
}

type Fields = Readonly<Record<string, unknown>>
type Success<T> = Extract<Result<T>, { ok: true }>
type Failure = Extract<Result<unknown>, { ok: false }>

const isSuccess = <T>(result: Result<T>): result is Success<T> => result.ok
const isFailure = <T>(result: Result<T>): result is Failure => !result.ok

const isRecord = (value: unknown): value is Fields =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

const isTimestamp = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

const isTagList = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((tag) => typeof tag === 'string')

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

const fieldRules: readonly (readonly [string, (value: unknown) => boolean, string])[] = [
  ['id', isText, 'a text "id"'],
  ['title', isText, 'a text "title"'],
  ['body', (value) => typeof value === 'string', 'a text "body"'],
  ['tags', isTagList, 'a "tags" list of text'],
  ['createdAt', isTimestamp, 'a "createdAt" time in milliseconds'],
  ['updatedAt', isTimestamp, 'an "updatedAt" time in milliseconds'],
  [
    'pinned',
    (value) => value === undefined || typeof value === 'boolean',
    'a true or false "pinned"',
  ],
  ['useCount', (value) => value === undefined || isCount(value), 'a whole number "useCount"'],
  [
    'lastUsedAt',
    (value) => value === undefined || value === null || isTimestamp(value),
    'a "lastUsedAt" time in milliseconds or null',
  ],
]

const toPrompt = (fields: Fields): Prompt => ({
  id: fields['id'] as string,
  title: (fields['title'] as string).trim(),
  body: fields['body'] as string,
  tags: normalizeTags(fields['tags'] as readonly string[]),
  createdAt: fields['createdAt'] as number,
  updatedAt: fields['updatedAt'] as number,
  pinned: fields['pinned'] === true,
  useCount: (fields['useCount'] as number | undefined) ?? 0,
  lastUsedAt: (fields['lastUsedAt'] as number | null | undefined) ?? null,
})

export const validatePrompt = (value: unknown, position: number): Result<Prompt> => {
  if (!isRecord(value)) return { ok: false, error: `Prompt ${position} is not an object.` }
  const first = fieldRules.find(([key, isValid]) => !isValid(value[key]))
  return first === undefined
    ? { ok: true, value: toPrompt(value) }
    : { ok: false, error: `Prompt ${position} needs ${first[2]}.` }
}

const validateAll = (items: readonly unknown[]): readonly Result<Prompt>[] =>
  items.map((item, index) => validatePrompt(item, index + 1))

const promptList = (data: unknown): Result<readonly unknown[]> => {
  if (Array.isArray(data)) return { ok: true, value: data }
  if (!isRecord(data)) return { ok: false, error: 'The file does not contain a prompt library.' }
  if (data['version'] !== undefined && data['version'] !== 1) {
    return { ok: false, error: 'The file has a version that this app cannot read.' }
  }
  const prompts = data['prompts']
  return Array.isArray(prompts)
    ? { ok: true, value: prompts }
    : { ok: false, error: 'The file has no "prompts" list.' }
}

export const decodeLibrary = (data: unknown): Result<readonly Prompt[]> => {
  const list = promptList(data)
  if (!list.ok) return list
  const results = validateAll(list.value)
  const failure = results.find(isFailure)
  return failure ?? { ok: true, value: results.filter(isSuccess).map((result) => result.value) }
}

const withUniqueIds = (prompts: readonly Prompt[]): readonly Prompt[] =>
  prompts.filter((prompt, index) => prompts.findIndex((other) => other.id === prompt.id) === index)

export const restoreLibrary = (data: unknown): RestoredLibrary => {
  const list = promptList(data)
  if (!list.ok) return { prompts: [], damaged: true }
  const valid = validateAll(list.value)
    .filter(isSuccess)
    .map((result) => result.value)
  const prompts = withUniqueIds(valid)
  return { prompts, damaged: prompts.length !== list.value.length }
}

export const encodeLibrary = (prompts: readonly Prompt[]): LibraryFile => ({
  version: 1,
  prompts,
})

export const planImport = (
  existing: readonly Prompt[],
  incoming: readonly Prompt[],
): ImportPlan => {
  const existingIds = new Set(existing.map((prompt) => prompt.id))
  const toAdd = withUniqueIds(incoming).filter((prompt) => !existingIds.has(prompt.id))
  return { toAdd, skipped: incoming.length - toAdd.length }
}
