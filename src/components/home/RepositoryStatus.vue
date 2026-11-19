<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@ui-sdk/vue/button'
import { repositoryStats, type Repository } from '@/core/repository'
import type { Result } from '@/core/result'
import { repositoryName } from '@/home/content'
import { useRepositorySource } from '@/ports/repository-source'

const source = useRepositorySource()
const result = ref<Result<Repository>>()
const checkedAt = ref(0)

const stats = computed(() =>
  result.value?.ok === true ? repositoryStats(result.value.value, checkedAt.value) : [],
)
const error = computed(() => (result.value?.ok === false ? result.value.error : ''))

const load = async () => {
  result.value = undefined
  const next = await source.getRepository(repositoryName)
  checkedAt.value = Date.now()
  result.value = next
}

onMounted(() => {
  void load()
})
</script>

<template>
  <section aria-labelledby="live-title" class="border border-(--ui-foreground)">
    <div
      class="flex items-center justify-between border-b border-(--ui-foreground) px-3 py-1.5 text-xs uppercase"
    >
      <h2 id="live-title">Live from GitHub</h2>
      <span
        class="size-2"
        :class="error === '' ? 'bg-(--accent)' : 'bg-(--ui-destructive)'"
        aria-hidden="true"
      />
    </div>
    <div aria-live="polite" class="p-3">
      <p v-if="result === undefined" class="text-(--ui-muted-foreground)">Loading…</p>
      <dl v-else-if="error === ''" class="grid grid-cols-2 gap-x-4 gap-y-2">
        <div v-for="stat in stats" :key="stat.label" class="flex flex-col">
          <dt class="text-xs text-(--ui-muted-foreground) uppercase">{{ stat.label }}</dt>
          <dd class="font-bold tabular-nums">{{ stat.value }}</dd>
        </div>
      </dl>
      <div v-else class="flex flex-col items-start gap-2">
        <p>{{ error }}</p>
        <Button @click="load">Try again</Button>
      </div>
    </div>
  </section>
</template>
