<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@ui-sdk/vue/toast'
import type { PromptDraft } from '@/core/prompts'
import { usePromptStore } from '@/stores/prompts'
import NotFound from '@/components/NotFound.vue'
import PromptForm from '@/components/PromptForm.vue'

const props = defineProps<{ id?: string | undefined }>()

const store = usePromptStore()
const router = useRouter()

const existing = computed(() => (props.id === undefined ? undefined : store.findPrompt(props.id)))
const emptyDraft: PromptDraft = { title: '', body: '', tags: [] }

const save = async (draft: PromptDraft) => {
  const saved = props.id === undefined ? store.addPrompt(draft) : store.editPrompt(props.id, draft)
  if (saved === undefined) return
  toast.success('Prompt saved', { description: saved.title })
  await router.push({ name: 'use', params: { id: saved.id } })
}

const cancel = async () => {
  await router.push(
    existing.value === undefined
      ? { name: 'list' }
      : { name: 'use', params: { id: existing.value.id } },
  )
}
</script>

<template>
  <NotFound v-if="id !== undefined && existing === undefined" message="No prompt has this ID." />
  <section v-else class="flex flex-col gap-5">
    <h1 class="text-2xl font-semibold">{{ existing ? 'Edit prompt' : 'New prompt' }}</h1>
    <PromptForm
      :key="existing?.id ?? 'new'"
      :initial="existing ?? emptyDraft"
      :submit-label="existing ? 'Save changes' : 'Create prompt'"
      @save="save"
      @cancel="cancel"
    />
  </section>
</template>
