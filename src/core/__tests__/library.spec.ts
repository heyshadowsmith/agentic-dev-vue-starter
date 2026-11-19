import { describe, expect, it } from 'vitest'
import {
  decodeLibrary,
  encodeLibrary,
  planImport,
  restoreLibrary,
  validatePrompt,
} from '../library'
import type { Prompt } from '../prompts'

const stored: Prompt = {
  id: 'p1',
  title: 'Summary',
  body: 'Summarize {{text}}',
  tags: ['writing'],
  createdAt: 100,
  updatedAt: 200,
  pinned: true,
  useCount: 2,
  lastUsedAt: 300,
}

const minimal = {
  id: 'p2',
  title: 'Minimal',
  body: '',
  tags: [],
  createdAt: 1,
  updatedAt: 1,
}

describe('validatePrompt', () => {
  it('accepts a full prompt', () => {
    expect(validatePrompt(stored, 1)).toStrictEqual({ ok: true, value: stored })
  })

  it('fills in optional fields', () => {
    expect(validatePrompt(minimal, 1)).toStrictEqual({
      ok: true,
      value: { ...minimal, pinned: false, useCount: 0, lastUsedAt: null },
    })
  })

  it('accepts a null last use', () => {
    expect(validatePrompt({ ...stored, lastUsedAt: null }, 1)).toStrictEqual({
      ok: true,
      value: { ...stored, lastUsedAt: null },
    })
  })

  it('cleans the title and the tags', () => {
    expect(validatePrompt({ ...minimal, title: ' T ', tags: ['A', 'a', ' '] }, 1)).toStrictEqual({
      ok: true,
      value: { ...minimal, title: 'T', tags: ['a'], pinned: false, useCount: 0, lastUsedAt: null },
    })
  })

  it('rejects a value that is not an object', () => {
    expect(validatePrompt('text', 4)).toStrictEqual({
      ok: false,
      error: 'Prompt 4 is not an object.',
    })
  })

  it('rejects an array', () => {
    expect(validatePrompt([], 1)).toStrictEqual({ ok: false, error: 'Prompt 1 is not an object.' })
  })

  it.each([
    ['id', { ...minimal, id: '' }, 'a text "id"'],
    ['title', { ...minimal, title: ' '.repeat(3) }, 'a text "title"'],
    ['body', { ...minimal, body: 5 }, 'a text "body"'],
    ['tags', { ...minimal, tags: [1] }, 'a "tags" list of text'],
    ['tags type', { ...minimal, tags: 'a,b' }, 'a "tags" list of text'],
    ['createdAt', { ...minimal, createdAt: -1 }, 'a "createdAt" time in milliseconds'],
    ['updatedAt', { ...minimal, updatedAt: NaN }, 'an "updatedAt" time in milliseconds'],
    ['pinned', { ...minimal, pinned: 'yes' }, 'a true or false "pinned"'],
    ['useCount', { ...minimal, useCount: 1.5 }, 'a whole number "useCount"'],
    [
      'lastUsedAt',
      { ...minimal, lastUsedAt: '2024' },
      'a "lastUsedAt" time in milliseconds or null',
    ],
  ])('rejects a bad %s', (_name, value, need) => {
    expect(validatePrompt(value, 2)).toStrictEqual({ ok: false, error: `Prompt 2 needs ${need}.` })
  })
})

describe('decodeLibrary', () => {
  it('reads an exported file', () => {
    expect(decodeLibrary(encodeLibrary([stored]))).toStrictEqual({ ok: true, value: [stored] })
  })

  it('reads a file without a version', () => {
    expect(decodeLibrary({ prompts: [stored] })).toStrictEqual({ ok: true, value: [stored] })
  })

  it('reads a plain list of prompts', () => {
    expect(decodeLibrary([stored])).toStrictEqual({ ok: true, value: [stored] })
  })

  it('reads an empty library', () => {
    expect(decodeLibrary({ version: 1, prompts: [] })).toStrictEqual({ ok: true, value: [] })
  })

  it('rejects a value that is not a library', () => {
    expect(decodeLibrary('hello')).toStrictEqual({
      ok: false,
      error: 'The file does not contain a prompt library.',
    })
  })

  it('rejects null', () => {
    expect(decodeLibrary(null)).toStrictEqual({
      ok: false,
      error: 'The file does not contain a prompt library.',
    })
  })

  it('rejects an unknown version', () => {
    expect(decodeLibrary({ version: 2, prompts: [] })).toStrictEqual({
      ok: false,
      error: 'The file has a version that this app cannot read.',
    })
  })

  it('rejects an object without a prompts list', () => {
    expect(decodeLibrary({ version: 1, items: [] })).toStrictEqual({
      ok: false,
      error: 'The file has no "prompts" list.',
    })
  })

  it('rejects the whole file when one prompt is bad', () => {
    expect(decodeLibrary({ prompts: [stored, { ...minimal, id: 7 }] })).toStrictEqual({
      ok: false,
      error: 'Prompt 2 needs a text "id".',
    })
  })
})

describe('encodeLibrary', () => {
  it('writes the version and the prompts', () => {
    expect(encodeLibrary([stored])).toStrictEqual({ version: 1, prompts: [stored] })
  })
})

describe('planImport', () => {
  const other = { ...stored, id: 'p3' }

  it('adds prompts with new ids', () => {
    expect(planImport([stored], [other])).toStrictEqual({ toAdd: [other], skipped: 0 })
  })

  it('skips prompts whose id already exists', () => {
    expect(planImport([stored], [{ ...stored, title: 'Changed' }, other])).toStrictEqual({
      toAdd: [other],
      skipped: 1,
    })
  })

  it('skips repeated ids inside the file', () => {
    expect(planImport([], [other, { ...other, title: 'Again' }])).toStrictEqual({
      toAdd: [other],
      skipped: 1,
    })
  })

  it('handles an empty file', () => {
    expect(planImport([stored], [])).toStrictEqual({ toAdd: [], skipped: 0 })
  })
})

describe('restoreLibrary', () => {
  it('restores saved prompts', () => {
    expect(restoreLibrary(encodeLibrary([stored]))).toStrictEqual({
      prompts: [stored],
      damaged: false,
    })
  })

  it('starts empty when the data is not a library', () => {
    expect(restoreLibrary(42)).toStrictEqual({ prompts: [], damaged: true })
  })

  it('keeps the valid prompts and reports damage', () => {
    expect(restoreLibrary({ version: 1, prompts: [stored, { id: 'x' }] })).toStrictEqual({
      prompts: [stored],
      damaged: true,
    })
  })

  it('drops repeated ids and reports damage', () => {
    expect(restoreLibrary([stored, stored])).toStrictEqual({ prompts: [stored], damaged: true })
  })
})
