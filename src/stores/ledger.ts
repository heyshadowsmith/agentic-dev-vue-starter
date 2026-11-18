import { defineStore } from 'pinia'
import { computed, shallowRef, watch } from 'vue'
import { computeBalances } from '@/core/balances'
import * as ledgerCore from '@/core/ledger'
import type { Ledger, Result } from '@/core/ledger'
import { settleUp } from '@/core/settle'
import { readLedger, writeLedger } from './ledger-storage'

export interface NewExpense {
  description: string
  amount: string
  paidBy: string | null
  splitAmong: readonly string[]
}

export const useLedgerStore = defineStore('ledger', () => {
  const ledger = shallowRef<Ledger>(readLedger(localStorage))

  watch(ledger, (next) => {
    writeLedger(localStorage, next)
  })

  const people = computed(() => ledger.value.people)
  const expenses = computed(() => ledger.value.expenses)
  const balances = computed(() => computeBalances(ledger.value))
  const payments = computed(() => settleUp(balances.value))

  const nameOf = (personId: string): string =>
    ledger.value.people.find((person) => person.id === personId)?.name ?? 'Unknown'

  const isInvolved = (personId: string): boolean => ledgerCore.isInvolved(ledger.value, personId)

  const apply = (result: Result<Ledger>): string | undefined => {
    if (!result.ok) return result.error
    ledger.value = result.value
    return undefined
  }

  const addPerson = (name: string) =>
    apply(ledgerCore.addPerson(ledger.value, { id: crypto.randomUUID(), name }))

  const removePerson = (personId: string) => apply(ledgerCore.removePerson(ledger.value, personId))

  const addExpense = (expense: NewExpense) =>
    apply(
      ledgerCore.addExpense(ledger.value, {
        ...expense,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }),
    )

  const deleteExpense = (expenseId: string) => {
    ledger.value = ledgerCore.deleteExpense(ledger.value, expenseId)
  }

  return {
    ledger,
    people,
    expenses,
    balances,
    payments,
    nameOf,
    isInvolved,
    addPerson,
    removePerson,
    addExpense,
    deleteExpense,
  }
})
