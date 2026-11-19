<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@ui-sdk/vue/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@ui-sdk/vue/field'
import { Input } from '@ui-sdk/vue/input'
import { Textarea } from '@ui-sdk/vue/textarea'
import { draftProblems, formatTags, parseTags } from '@/core/prompts'
import type { PromptDraft } from '@/core/prompts'
import { parseVariables } from '@/core/variables'

const syntax = { plain: '{{name}}', withDefault: '{{name|default text}}' }

const props = defineProps<{ initial: PromptDraft; submitLabel: string }>()
const emit = defineEmits<{ save: [draft: PromptDraft]; cancel: [] }>()

const title = ref(props.initial.title)
const body = ref(props.initial.body)
const tags = ref(formatTags(props.initial.tags))
const submitted = ref(false)

const draft = computed<PromptDraft>(() => ({
  title: title.value,
  body: body.value,
  tags: parseTags(tags.value),
}))
const variables = computed(() => parseVariables(body.value))
const titleMissing = computed(() => submitted.value && title.value.trim() === '')
const bodyMissing = computed(() => submitted.value && body.value.trim() === '')

const submit = () => {
  submitted.value = true
  if (draftProblems(draft.value).length === 0) emit('save', draft.value)
}
</script>

<template>
  <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
    <Field :invalid="titleMissing">
      <FieldLabel>Title</FieldLabel>
      <Input v-model="title" autocomplete="off" required />
      <FieldError>Enter a title.</FieldError>
    </Field>
    <Field :invalid="bodyMissing">
      <FieldLabel>Prompt</FieldLabel>
      <Textarea
        v-model="body"
        class="min-h-48 font-mono"
        auto-resize
        required
        submit-shortcut="mod+enter"
      />
      <FieldDescription>
        Write variables as <code>{{ syntax.plain }}</code
        >. Add a default value with <code>{{ syntax.withDefault }}</code
        >. Press Ctrl+Enter or Cmd+Enter to save.
      </FieldDescription>
      <FieldError>Enter the prompt text.</FieldError>
    </Field>
    <p class="text-sm" aria-live="polite">
      <template v-if="variables.length === 0">No variables found.</template>
      <template v-else>
        Variables:
        <span v-for="(variable, index) in variables" :key="variable.name">
          <code>{{ variable.name }}</code>
          <span v-if="variable.defaultValue !== ''" class="text-(--ui-muted-foreground)">
            (default: {{ variable.defaultValue }})</span
          ><span v-if="index < variables.length - 1">, </span>
        </span>
      </template>
    </p>
    <Field>
      <FieldLabel>Tags</FieldLabel>
      <Input v-model="tags" autocomplete="off" placeholder="writing, email" />
      <FieldDescription>Separate tags with commas.</FieldDescription>
    </Field>
    <div class="flex gap-2">
      <Button type="submit" data-variant="solid">{{ submitLabel }}</Button>
      <Button @click="emit('cancel')">Cancel</Button>
    </div>
  </form>
</template>
