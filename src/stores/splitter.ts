import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { computeBalances } from '@/core/balances'
import {
  addExpense,
  addPerson,
  deleteExpense,
  isPersonInvolved,
  removePerson,
  type ExpenseErrors,
} from '@/core/ledger'
import { parseCents } from '@/core/money'
import type { Result } from '@/core/result'
import { settleUp } from '@/core/settle'
import { loadState, saveState } from './persistence'

export interface ExpenseInput {
  readonly description: string
  readonly amountText: string
  readonly payerId: string | null
  readonly participantIds: readonly string[]
}

export const useSplitterStore = defineStore('splitter', () => {
  const state = ref(loadState(localStorage))

  watch(state, (next) => saveState(localStorage, next))

  const people = computed(() => state.value.people)
  const expenses = computed(() => state.value.expenses)
  const balances = computed(() => computeBalances(state.value.people, state.value.expenses))
  const payments = computed(() => settleUp(balances.value))

  const nameOf = (personId: string): string =>
    state.value.people.find((person) => person.id === personId)?.name ?? 'Unknown'

  const isInvolved = (personId: string): boolean => isPersonInvolved(state.value, personId)

  const apply = <E>(result: Result<typeof state.value, E>): Result<null, E> => {
    if (!result.ok) return result
    state.value = result.value
    return { ok: true, value: null }
  }

  const addPersonNamed = (name: string): Result<null> =>
    apply(addPerson(state.value, { id: crypto.randomUUID(), name }))

  const removePersonById = (personId: string): Result<null> =>
    apply(removePerson(state.value, personId))

  const addExpenseFrom = (input: ExpenseInput): Result<null, ExpenseErrors> =>
    apply(
      addExpense(state.value, {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        description: input.description,
        amount: parseCents(input.amountText),
        payerId: input.payerId,
        participantIds: input.participantIds,
      }),
    )

  const deleteExpenseById = (expenseId: string) => {
    state.value = deleteExpense(state.value, expenseId)
  }

  return {
    people,
    expenses,
    balances,
    payments,
    nameOf,
    isInvolved,
    addPerson: addPersonNamed,
    removePerson: removePersonById,
    addExpense: addExpenseFrom,
    deleteExpense: deleteExpenseById,
  }
})
