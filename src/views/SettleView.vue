<script setup lang="ts">
import { formatCents } from '@/core/money'
import { nameOf } from '@/core/people'
import { useLedgerStore } from '@/stores/ledger'

const store = useLedgerStore()
</script>

<template>
  <section aria-labelledby="settle-heading" class="flex flex-col gap-3">
    <h2 id="settle-heading" class="text-xl font-semibold">Settle up</h2>
    <ul v-if="store.payments.length > 0" class="flex flex-col gap-2">
      <li
        v-for="payment in store.payments"
        :key="`${payment.fromId}-${payment.toId}`"
        class="rounded border border-(--ui-border) p-3"
      >
        {{ nameOf(store.people, payment.fromId) }} pays {{ nameOf(store.people, payment.toId) }}
        {{ formatCents(payment.cents) }}
      </li>
    </ul>
    <p v-else>Everyone is settled up. Nobody needs to pay.</p>
  </section>
</template>
