import { describe, expect, it } from 'vitest'
import {
  addPerson,
  isInvolved,
  nameOf,
  normalizeName,
  removePerson,
  validateName,
} from '../people.ts'
import { alex, expense, kim, ledgerOf, sam } from './fixtures.ts'

describe('normalizeName', () => {
  it('trims and joins spaces', () => {
    expect(normalizeName('  Mary   Ann  ')).toBe('Mary Ann')
  })
})

describe('validateName', () => {
  it('accepts a new name', () => {
    expect(validateName(' Kim ', [alex, sam])).toStrictEqual({ ok: true, value: 'Kim' })
  })

  it('rejects an empty name', () => {
    expect(validateName(' '.repeat(3), [])).toStrictEqual({ ok: false, error: 'Enter a name.' })
  })

  it('rejects a name that is too long', () => {
    expect(validateName('x'.repeat(41), [])).toStrictEqual({
      ok: false,
      error: 'The name is too long.',
    })
  })

  it('rejects a name that differs only in case', () => {
    expect(validateName('aLEX', [alex])).toStrictEqual({
      ok: false,
      error: 'aLEX is already in the group.',
    })
  })
})

describe('addPerson', () => {
  it('adds the person with a clean name', () => {
    expect(addPerson(ledgerOf([alex]), { id: 'sam', name: ' Sam ' })).toStrictEqual({
      ok: true,
      value: ledgerOf([alex, sam]),
    })
  })

  it('refuses a duplicate name', () => {
    expect(addPerson(ledgerOf([alex]), { id: 'other', name: 'ALEX' })).toStrictEqual({
      ok: false,
      error: 'ALEX is already in the group.',
    })
  })
})

describe('removePerson', () => {
  const ledger = ledgerOf([alex, sam, kim], [expense('e1', 1000, 'alex', ['sam'])])

  it('removes a person without expenses', () => {
    expect(removePerson(ledger, 'kim')).toStrictEqual({
      ok: true,
      value: ledgerOf([alex, sam], ledger.expenses),
    })
  })

  it('refuses to remove the payer of an expense', () => {
    expect(removePerson(ledger, 'alex')).toStrictEqual({
      ok: false,
      error: 'This person is part of an expense. Delete those expenses first.',
    })
  })

  it('refuses to remove a person in a split', () => {
    expect(removePerson(ledger, 'sam').ok).toBe(false)
  })
})

describe('isInvolved', () => {
  const ledger = ledgerOf([alex, sam, kim], [expense('e1', 1000, 'alex', ['sam'])])

  it.each([
    ['alex', true],
    ['sam', true],
    ['kim', false],
  ])('says %s involved is %s', (personId, involved) => {
    expect(isInvolved(ledger, personId)).toBe(involved)
  })
})

describe('nameOf', () => {
  it('finds the name of a person', () => {
    expect(nameOf([alex, sam], 'sam')).toBe('Sam')
  })

  it('gives a fallback for an unknown person', () => {
    expect(nameOf([alex], 'ghost')).toBe('Unknown person')
  })
})
