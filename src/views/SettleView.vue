<script setup lang="ts">
import { formatCents } from '@/core/money'
import { useSplitterStore } from '@/stores/splitter'

const store = useSplitterStore()
</script>

<template>
  <section aria-labelledby="settle-heading" class="flex flex-col gap-3">
    <h2 id="settle-heading" class="text-lg font-semibold">Settle up</h2>
    <p v-if="store.payments.length === 0">Everyone is settled up.</p>
    <template v-else>
      <p class="text-sm">These payments bring every balance to zero.</p>
      <ol class="flex list-decimal flex-col gap-1 ps-6">
        <li v-for="payment in store.payments" :key="`${payment.fromId}-${payment.toId}`">
          {{ store.nameOf(payment.fromId) }} pays {{ store.nameOf(payment.toId) }}
          {{ formatCents(payment.amountCents) }}
        </li>
      </ol>
    </template>
  </section>
</template>
