<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { formatCents } from '@/core/money'
import { useLedgerStore } from '@/stores/ledger'

const store = useLedgerStore()

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

const names = (personIds: readonly string[]) =>
  personIds.map((personId) => store.nameOf(personId)).join(', ')
</script>

<template>
  <section aria-labelledby="expenses-heading" class="flex flex-col gap-3">
    <h2 id="expenses-heading" class="text-lg font-semibold">Expenses</h2>
    <p v-if="store.expenses.length === 0" class="text-neutral-600 dark:text-neutral-400">
      No expenses yet.
    </p>
    <ul v-else class="flex flex-col divide-y divide-neutral-300 dark:divide-neutral-700">
      <li
        v-for="expense in store.expenses"
        :key="expense.id"
        class="flex flex-wrap items-center justify-between gap-2 py-2"
      >
        <div class="flex flex-col">
          <span class="font-medium">
            {{ expense.description }}: {{ formatCents(expense.amountCents) }}
          </span>
          <span class="text-sm text-neutral-600 dark:text-neutral-400">
            Paid by {{ store.nameOf(expense.paidBy) }}, split among {{ names(expense.splitAmong) }}.
            <time :datetime="expense.createdAt">{{ formatDate(expense.createdAt) }}</time>
          </span>
        </div>
        <Button
          data-variant="destructive"
          :data-agent-confirm="`Deletes the expense ${expense.description} of ${formatCents(expense.amountCents)}`"
          @click="store.deleteExpense(expense.id)"
        >
          Delete <span class="sr-only">{{ expense.description }}</span>
        </Button>
      </li>
    </ul>
  </section>
</template>
