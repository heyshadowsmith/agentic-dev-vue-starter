<script setup lang="ts">
import { formatCents } from '@/core/money'
import { nameOf } from '@/core/people'
import { useLedgerStore } from '@/stores/ledger'

const store = useLedgerStore()

const describe = (cents: number): string => {
  if (cents > 0) return `is owed ${formatCents(cents)}`
  if (cents < 0) return `owes ${formatCents(-cents)}`
  return 'is settled up'
}
</script>

<template>
  <section aria-labelledby="balances-heading" class="flex flex-col gap-3">
    <h2 id="balances-heading" class="text-xl font-semibold">Balances</h2>
    <ul v-if="store.balances.length > 0" class="flex flex-col gap-2">
      <li
        v-for="balance in store.balances"
        :key="balance.personId"
        class="flex justify-between gap-4 rounded border border-(--ui-border) p-3"
      >
        <span>{{ nameOf(store.people, balance.personId) }} {{ describe(balance.cents) }}</span>
        <span class="font-mono tabular-nums">{{ formatCents(balance.cents) }}</span>
      </li>
    </ul>
    <p v-else>Add people to see their balances.</p>
  </section>
</template>
