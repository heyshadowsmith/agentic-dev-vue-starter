<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { countByStage } from '@/core/checks'
import { totalSeconds } from '@/core/pipeline'
import { copyText } from '@/lib/clipboard'
import { checks } from '@/home/checks'
import { ciSteps } from '@/home/ci-run'
import { quickStart, templateUrl } from '@/home/content'
import RepositoryStatus from './RepositoryStatus.vue'

const specs = [
  { label: 'Example checks', value: String(countByStage(checks).all) },
  { label: 'CI run', value: `${String(totalSeconds(ciSteps))} s` },
  { label: 'Core coverage', value: '100%' },
  { label: 'Comments in code', value: '0' },
]
</script>

<template>
  <section aria-labelledby="hero-title" class="grid gap-8 lg:grid-cols-[1fr_22rem]">
    <div class="flex flex-col gap-6">
      <p class="text-xs tracking-widest text-(--ui-muted-foreground) uppercase">
        Vue starter / for coding agents
      </p>
      <h1
        id="hero-title"
        class="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-5xl"
      >
        Every rule is a check<span class="text-(--accent)">.</span>
      </h1>
      <p class="max-w-2xl text-(--ui-muted-foreground)">
        Lint, types, prose, architecture, dead code and supply chain. They run on each commit and
        again in CI, so an agent gets an exact error instead of a review comment.
      </p>
      <div class="flex flex-col border border-(--ui-foreground)">
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-(--ui-foreground) px-3 py-2 text-xs uppercase"
        >
          <span><span class="text-(--accent)">1</span> Make your own copy</span>
          <Button>
            <template #render="{ props }">
              <a
                v-bind="props"
                :href="templateUrl"
                class="border-(--accent)! bg-(--accent)! font-bold text-(--accent-foreground)! no-underline"
                >Use this template</a
              >
            </template>
          </Button>
        </div>
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-(--ui-border) px-3 py-2 text-xs uppercase"
        >
          <span><span class="text-(--accent)">2</span> Run it</span>
          <Button @click="copyText(quickStart, 'commands')">Copy commands</Button>
        </div>
        <pre class="px-3 py-3" data-testid="quick-start">{{ quickStart }}</pre>
      </div>
    </div>
    <div class="flex flex-col gap-4 self-start">
      <dl class="grid grid-cols-2 border-t border-l border-(--ui-foreground)">
        <div
          v-for="spec in specs"
          :key="spec.label"
          class="flex flex-col gap-1 border-r border-b border-(--ui-foreground) p-3"
        >
          <dt class="text-xs text-(--ui-muted-foreground) uppercase">{{ spec.label }}</dt>
          <dd class="text-2xl font-bold tabular-nums">{{ spec.value }}</dd>
        </div>
      </dl>
      <RepositoryStatus />
    </div>
  </section>
</template>
