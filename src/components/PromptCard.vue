<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Toggle } from '@ui-sdk/vue/toggle'
import type { Prompt } from '@/core/prompts'
import { parseVariables } from '@/core/variables'
import { usePromptStore } from '@/stores/prompts'
import PromptActions from './PromptActions.vue'
import UsageSummary from './UsageSummary.vue'

const props = defineProps<{ prompt: Prompt }>()

const store = usePromptStore()
const variableCount = computed(() => parseVariables(props.prompt.body).length)
</script>

<template>
  <article
    class="flex flex-col gap-2 border border-(--ui-border) p-4"
    :data-pinned="prompt.pinned || undefined"
  >
    <div class="flex items-start justify-between gap-3">
      <h2 class="text-base font-semibold">
        <RouterLink :to="{ name: 'use', params: { id: prompt.id } }">{{ prompt.title }}</RouterLink>
      </h2>
      <Toggle
        :pressed="prompt.pinned"
        :aria-label="`Pin ${prompt.title}`"
        class="h-7 text-xs data-pressed:border-(--ui-primary) data-pressed:bg-(--ui-primary) data-pressed:text-(--ui-primary-foreground)"
        @pressed-change="store.togglePinned(prompt.id)"
      >
        Pin
      </Toggle>
    </div>
    <p class="line-clamp-2 text-sm whitespace-pre-line text-(--ui-muted-foreground)">
      {{ prompt.body }}
    </p>
    <ul v-if="prompt.tags.length > 0" class="flex flex-wrap gap-1.5" aria-label="Tags">
      <li v-for="tag in prompt.tags" :key="tag" class="bg-(--ui-muted) px-2 py-0.5 text-xs">
        #{{ tag }}
      </li>
    </ul>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-xs text-(--ui-muted-foreground)">
        {{ variableCount }} {{ variableCount === 1 ? 'variable' : 'variables' }} ·
        <UsageSummary :prompt="prompt" />
      </p>
      <div class="flex flex-wrap gap-2">
        <RouterLink
          :to="{ name: 'use', params: { id: prompt.id } }"
          class="link-button"
          data-variant="solid"
          :aria-label="`Use ${prompt.title}`"
        >
          Use
        </RouterLink>
        <RouterLink
          :to="{ name: 'edit', params: { id: prompt.id } }"
          class="link-button"
          :aria-label="`Edit ${prompt.title}`"
        >
          Edit
        </RouterLink>
        <PromptActions :prompt="prompt" />
      </div>
    </div>
  </article>
</template>
