<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { copyText } from '@/lib/clipboard'
import { quickStart, templateUrl } from '@/home/content'
</script>

<template>
  <section
    aria-labelledby="hero-title"
    class="grid items-end gap-8 lg:grid-cols-[1fr_minmax(24rem,28rem)]"
  >
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
    </div>
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
  </section>
</template>
