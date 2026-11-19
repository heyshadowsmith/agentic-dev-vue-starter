<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Button } from '@ui-sdk/vue/button'
import { Field, FieldLabel } from '@ui-sdk/vue/field'
import { Textarea } from '@ui-sdk/vue/textarea'
import { toast } from '@ui-sdk/vue/toast'
import { defaultValues, fillTemplate, parseVariables } from '@/core/variables'
import { copyText } from '@/lib/browser'
import { usePromptStore } from '@/stores/prompts'
import NotFound from '@/components/NotFound.vue'
import PromptActions from '@/components/PromptActions.vue'
import UsageSummary from '@/components/UsageSummary.vue'

const props = defineProps<{ id: string }>()

const store = usePromptStore()
const router = useRouter()

const prompt = computed(() => store.findPrompt(props.id))
const variables = computed(() => parseVariables(prompt.value?.body ?? ''))
const values = ref<Record<string, string>>({})
const result = computed(() => fillTemplate(prompt.value?.body ?? '', values.value))

const resetValues = () => {
  values.value = { ...defaultValues(variables.value) }
}

const setValue = (name: string, value: string) => {
  values.value = { ...values.value, [name]: value }
}

watch(() => props.id, resetValues, { immediate: true })

const copy = async () => {
  const current = prompt.value
  if (current === undefined) return
  if (!(await copyText(result.value))) {
    toast.error('Could not copy the prompt', {
      description: 'The browser blocked the clipboard. Select the preview text and copy it.',
    })
    return
  }
  store.markUsed(current.id)
  toast.success('Copied to the clipboard', { description: current.title })
}

const goToList = async () => {
  await router.push({ name: 'list' })
}
</script>

<template>
  <NotFound v-if="prompt === undefined" message="No prompt has this ID." />
  <section v-else class="flex flex-col gap-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold">{{ prompt.title }}</h1>
        <p class="text-sm text-(--ui-muted-foreground)">
          <UsageSummary :prompt="prompt" />
          <template v-if="prompt.tags.length > 0">
            · {{ prompt.tags.map((tag) => `#${tag}`).join(' ') }}
          </template>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink :to="{ name: 'edit', params: { id: prompt.id } }" class="link-button">
          Edit
        </RouterLink>
        <PromptActions :prompt="prompt" @deleted="goToList" />
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <div class="flex flex-col gap-3">
        <h2 class="text-lg font-semibold">Variables</h2>
        <p v-if="variables.length === 0" class="text-sm text-(--ui-muted-foreground)">
          This prompt has no variables. Copy it as it is.
        </p>
        <Field v-for="variable in variables" :key="variable.name">
          <FieldLabel>{{ variable.name }}</FieldLabel>
          <Textarea
            :value="values[variable.name] ?? ''"
            class="min-h-9"
            auto-resize
            rows="1"
            @value-change="(value) => setValue(variable.name, value)"
          />
        </Field>
        <div v-if="variables.length > 0">
          <Button @click="resetValues">Reset to defaults</Button>
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <h2 id="preview-heading" class="text-lg font-semibold">Preview</h2>
        <output
          aria-labelledby="preview-heading"
          class="block min-h-24 border border-(--ui-border) bg-(--ui-muted) p-3 font-mono text-sm whitespace-pre-wrap"
          >{{ result }}</output
        >
        <div>
          <Button data-variant="solid" @click="copy">Copy to clipboard</Button>
        </div>
      </div>
    </div>
  </section>
</template>
