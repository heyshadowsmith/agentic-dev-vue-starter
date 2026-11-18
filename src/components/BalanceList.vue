<script setup lang="ts">
import { formatCents } from '@/core/money'
import { useLedgerStore } from '@/stores/ledger'

const store = useLedgerStore()

const describe = (cents: number) => {
  if (cents > 0) return `is owed ${formatCents(cents)}`
  if (cents < 0) return `owes ${formatCents(-cents)}`
  return 'is settled up'
}
</script>

<template>
  <section aria-labelledby="balances-heading" class="flex flex-col gap-3">
    <h2 id="balances-heading" class="text-lg font-semibold">Balances</h2>
    <p v-if="store.balances.length === 0" class="text-neutral-600 dark:text-neutral-400">
      No people yet.
    </p>
    <ul v-else class="flex flex-col gap-1">
      <li
        v-for="balance in store.balances"
        :key="balance.personId"
        class="flex justify-between gap-2"
      >
        <span>{{ store.nameOf(balance.personId) }} {{ describe(balance.cents) }}</span>
        <span class="font-mono tabular-nums">{{ formatCents(balance.cents) }}</span>
      </li>
    </ul>
  </section>
</template>
