<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Button } from '@ui-sdk/vue/button'
import { repositoryActivity } from '@/core/repository'
import { useRepositoryStore } from '@/stores/repository'

const store = useRepositoryStore()
const activity = computed(() =>
  store.repository === undefined ? [] : repositoryActivity(store.repository, store.checkedAt),
)

onMounted(() => {
  void store.ensureLoaded()
})
</script>

<template>
  <div aria-live="polite" class="flex flex-wrap items-center gap-x-3 gap-y-1">
    <span
      class="size-2 shrink-0"
      :class="store.error === '' ? 'bg-(--accent)' : 'bg-(--ui-destructive)'"
      aria-hidden="true"
    />
    <template v-if="store.error !== ''">
      <span>{{ store.error }}</span>
      <Button class="normal-case" @click="store.load">Try again</Button>
    </template>
    <span v-else-if="activity.length === 0">Loading repository activity…</span>
    <ul v-else class="flex flex-wrap gap-x-3" aria-label="Repository activity">
      <li v-for="item in activity" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>
