<script setup lang="ts">
import { formatCents } from '@/core/money'
import { useLedgerStore } from '@/stores/ledger'

const store = useLedgerStore()
</script>

<template>
  <section aria-labelledby="settle-heading" class="flex flex-col gap-3">
    <h2 id="settle-heading" class="text-lg font-semibold">Settle up</h2>
    <p v-if="store.payments.length === 0" class="text-neutral-600 dark:text-neutral-400">
      Everyone is settled up.
    </p>
    <ol v-else class="flex flex-col gap-1">
      <li v-for="payment in store.payments" :key="`${payment.from}-${payment.to}`">
        {{ store.nameOf(payment.from) }} pays {{ store.nameOf(payment.to) }}
        {{ formatCents(payment.cents) }}
      </li>
    </ol>
  </section>
</template>
