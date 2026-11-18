<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6 p-4">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold">Expense splitter</h1>
      <nav aria-label="Main" class="flex gap-4">
        <RouterLink
          to="/"
          class="no-underline underline-offset-4 aria-[current=page]:font-semibold aria-[current=page]:underline"
        >
          Balances
        </RouterLink>
        <RouterLink
          to="/settle"
          class="no-underline underline-offset-4 aria-[current=page]:font-semibold aria-[current=page]:underline"
        >
          Settle up
        </RouterLink>
      </nav>
    </header>
    <main class="flex flex-col gap-8">
      <RouterView />
    </main>
  </div>
</template>
