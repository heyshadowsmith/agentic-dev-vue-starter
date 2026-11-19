<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{ message: string }>()
</script>

<template>
  <section class="flex flex-col items-start gap-3 py-12">
    <h1 class="text-xl font-semibold">Not found</h1>
    <p class="text-(--ui-muted-foreground)">{{ message }}</p>
    <RouterLink to="/">Back to all prompts</RouterLink>
  </section>
</template>
