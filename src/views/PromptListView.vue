<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Button } from '@ui-sdk/vue/button'
import { collectTags, queryPrompts } from '@/core/query'
import { useListFilters } from '@/stores/list-filters'
import { usePromptStore } from '@/stores/prompts'
import ImportExport from '@/components/ImportExport.vue'
import ListFilters from '@/components/ListFilters.vue'
import PromptCard from '@/components/PromptCard.vue'

const syntax = { plain: '{{name}}', withDefault: '{{name|default}}' }

const store = usePromptStore()
const filters = useListFilters()

const availableTags = computed(() => collectTags(store.prompts))
const activeTags = computed(() => filters.tags.filter((tag) => availableTags.value.includes(tag)))
const results = computed(() =>
  queryPrompts(store.prompts, { text: filters.text, tags: activeTags.value, sort: filters.sort }),
)
</script>

<template>
  <section class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">Prompts</h1>
      <div class="flex flex-wrap gap-2">
        <ImportExport />
        <RouterLink to="/new" class="link-button" data-variant="solid">New prompt</RouterLink>
      </div>
    </div>
    <div
      v-if="store.prompts.length === 0"
      class="flex flex-col items-start gap-3 border border-dashed border-(--ui-border) p-8"
    >
      <h2 class="text-lg font-semibold">No prompts yet</h2>
      <p class="text-(--ui-muted-foreground)">
        Save a prompt once and reuse it with new details each time. Write variables as
        <code>{{ syntax.plain }}</code> or <code>{{ syntax.withDefault }}</code
        >.
      </p>
      <RouterLink to="/new" class="link-button" data-variant="solid">
        Create your first prompt
      </RouterLink>
    </div>
    <template v-else>
      <ListFilters :available-tags="availableTags" />
      <p class="text-sm text-(--ui-muted-foreground)" role="status">
        {{ results.length }} of {{ store.prompts.length }} prompts
      </p>
      <div v-if="results.length === 0" class="flex flex-col items-start gap-3 py-6">
        <p>No prompts match your search.</p>
        <Button @click="filters.clear()">Clear search and tags</Button>
      </div>
      <ul v-else class="flex flex-col gap-3" aria-label="Prompts">
        <li v-for="prompt in results" :key="prompt.id">
          <PromptCard :prompt="prompt" />
        </li>
      </ul>
    </template>
  </section>
</template>
