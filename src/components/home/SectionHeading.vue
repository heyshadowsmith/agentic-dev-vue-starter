<script setup lang="ts">
defineProps<{ id: string; index: string; title: string }>()
</script>

<template>
  <div class="flex items-baseline gap-3 border-b border-(--ui-foreground) pb-2">
    <span class="text-(--accent)" aria-hidden="true">{{ index }}</span>
    <h2 :id="id" tabindex="-1" class="text-sm font-bold tracking-widest uppercase outline-none">
      {{ title }}
    </h2>
    <slot />
  </div>
</template>
