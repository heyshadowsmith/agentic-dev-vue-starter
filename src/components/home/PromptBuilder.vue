<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { Checkbox, CheckboxIndicator } from '@ui-sdk/vue/checkbox'
import { Field, FieldDescription, FieldLabel } from '@ui-sdk/vue/field'
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from '@ui-sdk/vue/segmented-control'
import { Textarea } from '@ui-sdk/vue/textarea'
import { isChangeKind } from '@/core/prompt'
import { copyText } from '@/lib/clipboard'
import { usePromptStore, type PromptFlag } from '@/stores/prompt'
import SectionHeading from './SectionHeading.vue'

const store = usePromptStore()

const flagLabels: readonly { flag: PromptFlag; label: string }[] = [
  { flag: 'testsFirst', label: 'Write the tests first' },
  { flag: 'pureCore', label: 'Keep logic in src/core' },
  { flag: 'askBeforeDependencies', label: 'Ask before adding dependencies' },
  { flag: 'openPullRequest', label: 'Open a pull request at the end' },
]

const chooseKind = (value: unknown) => {
  if (isChangeKind(value)) store.kind = value
}
</script>

<template>
  <section aria-labelledby="prompt" class="flex flex-col gap-4">
    <SectionHeading id="prompt" index="01" title="Prompt" />
    <p class="max-w-2xl text-(--ui-muted-foreground)">
      Describe the change. Paste the prompt into your agent. AGENTS.md and the checks do the rest.
    </p>
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="flex flex-col gap-5">
        <Field>
          <FieldLabel>Task</FieldLabel>
          <Textarea
            v-model="store.task"
            placeholder="Add a settings page with a dark mode switch."
          />
        </Field>
        <Field>
          <FieldLabel>Change type</FieldLabel>
          <SegmentedControl :model-value="store.kind" @value-change="chooseKind">
            <SegmentedControlIndicator />
            <SegmentedControlItem value="feat">feat</SegmentedControlItem>
            <SegmentedControlItem value="fix">fix</SegmentedControlItem>
            <SegmentedControlItem value="refactor">refactor</SegmentedControlItem>
          </SegmentedControl>
          <FieldDescription>Sets the verb and the commit type.</FieldDescription>
        </Field>
        <fieldset class="flex flex-col gap-2">
          <legend class="mb-2 text-xs font-bold uppercase">Rules for this task</legend>
          <label v-for="item in flagLabels" :key="item.flag" class="flex items-center gap-2">
            <Checkbox
              :checked="store.flags[item.flag]"
              @checked-change="(checked: unknown) => store.setFlag(item.flag, checked === true)"
            >
              <CheckboxIndicator />
            </Checkbox>
            {{ item.label }}
          </label>
        </fieldset>
      </div>
      <div class="flex flex-col border border-(--ui-foreground)">
        <div
          class="flex items-center justify-between border-b border-(--ui-foreground) px-3 py-1.5 text-xs uppercase"
        >
          <span>Output</span>
          <Button @click="copyText(store.prompt, 'prompt')">Copy prompt</Button>
        </div>
        <pre
          class="flex-1 overflow-x-auto p-3 whitespace-pre-wrap"
          data-testid="prompt-output"
          aria-live="polite"
          >{{ store.prompt }}</pre>
      </div>
    </div>
  </section>
</template>
