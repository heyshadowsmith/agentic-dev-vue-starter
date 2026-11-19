<script setup lang="ts">
import { computed } from 'vue'
import type { Prompt } from '@/core/prompts'

const props = defineProps<{ prompt: Prompt }>()

const summary = computed(() => {
  const { useCount, lastUsedAt } = props.prompt
  if (lastUsedAt === null) return 'Never used'
  const times = useCount === 1 ? 'once' : `${useCount} times`
  return `Used ${times}, last on ${new Date(lastUsedAt).toLocaleString()}`
})
</script>

<template>
  <span>{{ summary }}</span>
</template>
