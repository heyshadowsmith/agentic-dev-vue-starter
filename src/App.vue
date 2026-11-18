<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
    <header class="flex flex-wrap items-baseline justify-between gap-4">
      <h1 class="text-2xl font-semibold">Expense splitter</h1>
      <nav aria-label="Main" class="flex gap-4">
        <RouterLink class="aria-[current=page]:font-semibold" to="/"> Balances </RouterLink>
        <RouterLink class="aria-[current=page]:font-semibold" to="/settle"> Settle up </RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
