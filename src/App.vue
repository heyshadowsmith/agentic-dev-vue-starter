<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold">Expense splitter</h1>
      <nav aria-label="Main" class="flex gap-4">
        <RouterLink to="/" class="underline-offset-4 hover:underline" active-class="font-semibold">
          Balances
        </RouterLink>
        <RouterLink
          to="/settle"
          class="underline-offset-4 hover:underline"
          active-class="font-semibold"
        >
          Settle up
        </RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
