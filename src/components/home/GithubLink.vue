<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { compactCount } from '@/core/repository'
import { repositoryUrl } from '@/home/content'
import { useRepositoryStore } from '@/stores/repository'

const store = useRepositoryStore()
const stars = computed(() =>
  store.repository === undefined ? '' : compactCount(store.repository.stars),
)

onMounted(() => {
  void store.ensureLoaded()
})
</script>

<template>
  <a
    :href="repositoryUrl"
    class="inline-flex items-center gap-2 text-xs uppercase underline underline-offset-4"
  >
    GitHub
    <span
      v-if="stars !== ''"
      class="border border-(--ui-border) px-1.5 tabular-nums no-underline"
      data-testid="star-count"
    >
      <span aria-hidden="true" class="text-(--accent)">★</span> {{ stars }}
      <span class="sr-only">stars</span>
    </span>
  </a>
</template>
