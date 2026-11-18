<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { formatCents } from '@/core/money'
import { nameOf } from '@/core/people'
import { useLedgerStore } from '@/stores/ledger'

const store = useLedgerStore()

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

const namesOf = (personIds: readonly string[]): string =>
  personIds.map((personId) => nameOf(store.people, personId)).join(', ')
</script>

<template>
  <section aria-labelledby="expenses-heading" class="flex flex-col gap-3">
    <h2 id="expenses-heading" class="text-xl font-semibold">Expenses</h2>
    <ul v-if="store.expenses.length > 0" class="flex flex-col gap-2">
      <li
        v-for="expense in store.expenses"
        :key="expense.id"
        class="flex flex-wrap items-start justify-between gap-3 rounded border border-(--ui-border) p-3"
      >
        <div class="flex flex-col gap-1">
          <span class="font-medium">
            {{ expense.description }}, {{ formatCents(expense.amountCents) }}
          </span>
          <span class="text-sm text-(--ui-muted-foreground)">
            {{ nameOf(store.people, expense.payerId) }} paid. Split among
            {{ namesOf(expense.participantIds) }}.
          </span>
          <time :datetime="expense.createdAt" class="text-sm text-(--ui-muted-foreground)">
            {{ dateFormat.format(new Date(expense.createdAt)) }}
          </time>
        </div>
        <Button
          :data-agent-confirm="`Deletes the expense ${expense.description}`"
          @click="store.deleteExpense(expense.id)"
        >
          Delete
          <span class="sr-only">
            expense {{ expense.description }}, {{ formatCents(expense.amountCents) }}
          </span>
        </Button>
      </li>
    </ul>
    <p v-else>No expenses yet.</p>
  </section>
</template>
