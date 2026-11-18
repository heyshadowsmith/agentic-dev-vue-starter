import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import { computeBalances } from '@/core/balances'
import { addExpense, deleteExpense, type ExpenseDraft } from '@/core/expenses'
import { addPerson, isInvolved, removePerson } from '@/core/people'
import { settleUp } from '@/core/settle'
import type { Ledger, Result } from '@/core/types'
import { loadLedger, isLedgerSaved } from './ledger-storage'

export const useLedgerStore = defineStore('ledger', () => {
  const ledger = shallowRef<Ledger>(loadLedger(localStorage))
  const people = computed(() => ledger.value.people)
  const expenses = computed(() => ledger.value.expenses)
  const balances = computed(() => computeBalances(ledger.value))
  const payments = computed(() => settleUp(balances.value))

  const commit = (result: Result<Ledger>): Result<Ledger> => {
    if (result.ok) {
      ledger.value = result.value
      isLedgerSaved(localStorage, result.value)
    }
    return result
  }

  return {
    people,
    expenses,
    balances,
    payments,
    isInvolved: (personId: string) => isInvolved(ledger.value, personId),
    addPerson: (name: string) => commit(addPerson(ledger.value, { id: crypto.randomUUID(), name })),
    removePerson: (personId: string) => commit(removePerson(ledger.value, personId)),
    addExpense: (draft: ExpenseDraft) =>
      commit(
        addExpense(ledger.value, draft, {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }),
      ),
    deleteExpense: (expenseId: string) =>
      commit({ ok: true, value: deleteExpense(ledger.value, expenseId) }),
  }
})
