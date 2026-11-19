<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@ui-sdk/vue/accordion'
import { Field, FieldLabel } from '@ui-sdk/vue/field'
import { Input } from '@ui-sdk/vue/input'
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from '@ui-sdk/vue/segmented-control'
import { countByStage, filterChecks, isStageFilter, type StageFilter } from '@/core/checks'
import { checks } from '@/home/checks'
import SectionHeading from './SectionHeading.vue'

const text = ref('')
const stage = ref<StageFilter>('all')

const counts = countByStage(checks)
const stages: readonly { value: StageFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'commit', label: 'Commit' },
  { value: 'ci', label: 'CI' },
]
const results = computed(() => filterChecks(checks, { text: text.value, stage: stage.value }))

const chooseStage = (value: unknown) => {
  if (isStageFilter(value)) stage.value = value
}
</script>

<template>
  <section aria-labelledby="checks" class="flex flex-col gap-4">
    <SectionHeading id="checks" index="02" title="Checks" />
    <p class="max-w-2xl text-(--ui-muted-foreground)">
      Real output from each tool. Open a check to see the exact error an agent gets.
    </p>
    <div class="flex flex-wrap items-end gap-4">
      <Field class="min-w-56 flex-1">
        <FieldLabel>Filter checks</FieldLabel>
        <Input v-model="text" type="search" placeholder="coverage, Date.now, cycle…" />
      </Field>
      <Field>
        <FieldLabel>Runs</FieldLabel>
        <SegmentedControl :model-value="stage" @value-change="chooseStage">
          <SegmentedControlIndicator />
          <SegmentedControlItem v-for="item in stages" :key="item.value" :value="item.value">
            {{ item.label }} {{ counts[item.value] }}
          </SegmentedControlItem>
        </SegmentedControl>
      </Field>
    </div>
    <p class="text-xs text-(--ui-muted-foreground) uppercase" aria-live="polite">
      Showing {{ results.length }} of {{ counts.all }}
    </p>
    <Accordion
      v-if="results.length > 0"
      multiple
      aria-label="Check results"
      class="max-w-none! border-t border-(--ui-foreground)"
    >
      <AccordionItem v-for="check in results" :key="check.id" :value="check.id">
        <AccordionHeader>
          <AccordionTrigger class="gap-3">
            <span
              class="w-16 shrink-0 border border-current px-1 text-center text-[0.6875rem] uppercase"
              :class="check.stage === 'ci' ? 'text-(--accent)' : 'text-(--ui-muted-foreground)'"
              >{{ check.stage }}</span
            >
            <span class="w-20 shrink-0 font-bold">{{ check.tool }}</span>
            <span class="flex-1 text-left">{{ check.catches }}</span>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          <pre
            class="overflow-x-auto bg-(--ui-muted) p-3 text-xs leading-relaxed"
          ><code>{{ check.example }}</code></pre>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
    <p v-else class="border border-dashed border-(--ui-border) p-6 text-center">
      No check matches. Clear the filter to see all {{ counts.all }}.
    </p>
  </section>
</template>
