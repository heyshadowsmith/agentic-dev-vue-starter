<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  visibleWaterfallRows,
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallCell,
  WaterfallColumnHeader,
  WaterfallHeaderRow,
  WaterfallIndicator,
  WaterfallRow,
  WaterfallRowHeader,
  type WaterfallBarLabelDetails,
  type WaterfallData,
  type WaterfallDataItem,
} from '@ui-sdk/vue/waterfall'
import { formatDuration, formatTime, groupNames, toSpans, totalSeconds } from '@/core/pipeline'
import { ciRun, ciSteps } from '@/home/ci-run'
import SectionHeading from './SectionHeading.vue'

const spans = toSpans(ciSteps) as WaterfallData
const expanded = ref<string[]>([...groupNames(ciSteps)])
const rows = computed(() => visibleWaterfallRows(spans, expanded.value))

const barLabel = (item: WaterfallDataItem, details: WaterfallBarLabelDetails) =>
  `${item.label}: starts at ${details.start}, takes ${details.duration}`
</script>

<template>
  <section aria-labelledby="ci-run" class="flex flex-col gap-4">
    <SectionHeading id="ci-run" index="03" title="CI run" />
    <p class="max-w-2xl text-(--ui-muted-foreground)">
      The Checks job of
      <a :href="ciRun.url" class="underline underline-offset-4">run #{{ ciRun.number }}</a>
      on {{ ciRun.date }}: every check in {{ totalSeconds(ciSteps) }} seconds. Use the arrow keys to
      walk the steps, and Left or Right to fold a group.
    </p>
    <div class="overflow-x-auto border border-(--ui-foreground)">
      <Waterfall
        v-model:expanded="expanded"
        aria-label="CI run steps"
        :items="spans"
        :format="formatTime"
        :get-bar-label="barLabel"
      >
        <WaterfallHeaderRow class="text-xs uppercase">
          <WaterfallColumnHeader class="px-2 text-left">Step</WaterfallColumnHeader>
          <WaterfallColumnHeader class="pr-3 text-right">Time</WaterfallColumnHeader>
          <WaterfallColumnHeader aria-label="Timeline" class="normal-case">
            <WaterfallAxis :max-ticks="4" />
          </WaterfallColumnHeader>
        </WaterfallHeaderRow>
        <WaterfallRow v-for="{ item } in rows" :key="item.value" :value="item.value">
          <WaterfallRowHeader>
            <WaterfallIndicator v-if="item.children">
              <span aria-hidden="true">▸</span>
            </WaterfallIndicator>
            {{ item.label }}
          </WaterfallRowHeader>
          <WaterfallCell>{{ formatDuration(item.duration) }}</WaterfallCell>
          <WaterfallBar />
        </WaterfallRow>
      </Waterfall>
    </div>
  </section>
</template>
