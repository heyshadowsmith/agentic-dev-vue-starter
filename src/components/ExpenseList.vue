<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@ui-sdk/vue/button'
import { formatCents } from '@/core/money'
import { useSplitterStore } from '@/stores/splitter'

const store = useSplitterStore()

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

const newestFirst = computed(() => [...store.expenses].reverse())

const formatDate = (iso: string): string => dateFormat.format(new Date(iso))

const namesOf = (personIds: readonly string[]): string =>
  personIds.map((personId) => store.nameOf(personId)).join(', ')
</script>

<template>
  <section aria-labelledby="expenses-heading" class="flex flex-col gap-3">
    <h2 id="expenses-heading" class="text-lg font-semibold">Expenses</h2>
    <p v-if="newestFirst.length === 0">No expenses yet.</p>
    <ul v-else class="flex flex-col gap-3">
      <li
        v-for="expense in newestFirst"
        :key="expense.id"
        class="flex flex-wrap items-start justify-between gap-2"
      >
        <div class="flex flex-col">
          <span class="font-medium">
            {{ expense.description }} · {{ formatCents(expense.amountCents) }}
          </span>
          <span class="text-sm">
            Paid by {{ store.nameOf(expense.payerId) }}, split among
            {{ namesOf(expense.participantIds) }}
          </span>
          <time class="text-sm" :datetime="expense.createdAt">
            {{ formatDate(expense.createdAt) }}
          </time>
        </div>
        <Button
          :data-agent-confirm="`Deletes the expense ${expense.description} of ${formatCents(expense.amountCents)}`"
          @click="store.deleteExpense(expense.id)"
        >
          Delete <span class="sr-only">{{ expense.description }}</span>
        </Button>
      </li>
    </ul>
  </section>
</template>
