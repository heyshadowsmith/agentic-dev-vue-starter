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

<style>
@layer components {
  [data-slot='waterfall'] {
    --waterfall-columns: minmax(7.5rem, 14rem) 3.25rem minmax(10rem, 1fr);
    display: grid;
    width: 100%;
  }

  :is([data-slot='waterfall-header-row'], [data-slot='waterfall-row']) {
    display: grid;
    grid-template-columns: var(--waterfall-columns);
    align-items: center;
    border-bottom: 1px solid var(--ui-border);
  }

  [data-slot='waterfall-row'] {
    min-height: 1.75rem;
    cursor: default;

    &[data-selected] {
      background: var(--ui-muted);
    }

    &:focus-visible,
    & :focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }
  }

  [data-slot='waterfall-row-header'] {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding-inline-start: calc((var(--waterfall-level) - 1) * 1.25rem + 0.25rem);
  }

  [data-slot='waterfall-row'][data-branch] [data-slot='waterfall-row-header'] {
    font-weight: 600;
    text-transform: uppercase;
  }

  [data-slot='waterfall-indicator'] {
    display: inline-grid;
    width: 1rem;
    place-items: center;
    transition: rotate 120ms;

    &[data-expanded] {
      rotate: 90deg;
    }
  }

  [data-slot='waterfall-cell'] {
    color: var(--ui-muted-foreground);
    text-align: end;
    padding-inline-end: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  [data-slot='waterfall-bar'] {
    position: relative;
    align-self: stretch;

    &::before {
      content: '';
      position: absolute;
      inset-block: 0.45rem;
      inset-inline-start: var(--waterfall-start);
      width: max(2px, var(--waterfall-size));
      background: var(--ui-foreground);
    }
  }

  [data-slot='waterfall-row'][data-branch] [data-slot='waterfall-bar']::before {
    background: var(--accent);
  }

  [data-slot='waterfall-axis'] {
    position: relative;
    display: block;
    height: 1.75rem;
  }

  [data-slot='waterfall-tick'] {
    position: absolute;
    inset-block: 0;
    inset-inline-start: var(--waterfall-tick);
    display: flex;
    align-items: center;
    padding-inline-start: 0.25rem;
    border-inline-start: 1px solid var(--ui-border);
    color: var(--ui-muted-foreground);
    font-size: 0.6875rem;
    white-space: nowrap;
  }
}
</style>
