<script setup lang="ts">
import { formatSignedCents } from '@/core/money'
import { useSplitterStore } from '@/stores/splitter'

const store = useSplitterStore()
</script>

<template>
  <section aria-labelledby="balances-heading" class="flex flex-col gap-3">
    <h2 id="balances-heading" class="text-lg font-semibold">Balances</h2>
    <p class="text-sm">A positive balance means the group owes that person money.</p>
    <p v-if="store.balances.length === 0">No balances yet.</p>
    <ul v-else class="flex flex-col gap-1">
      <li
        v-for="balance in store.balances"
        :key="balance.personId"
        class="flex justify-between gap-2"
      >
        <span>{{ store.nameOf(balance.personId) }}</span>
        <span class="font-mono">{{ formatSignedCents(balance.balanceCents) }}</span>
      </li>
    </ul>
  </section>
</template>
