<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@ui-sdk/vue/tabs'
import { toast } from '@ui-sdk/vue/toast'
import {
  ciChecks,
  commitChecks,
  principles,
  quickStart,
  repositoryUrl,
  stack,
} from '@/home/content'

const checkGroups = [
  { value: 'commit', label: 'On each commit', checks: commitChecks },
  { value: 'ci', label: 'In CI', checks: ciChecks },
] as const

const copyQuickStart = async () => {
  try {
    await navigator.clipboard.writeText(quickStart)
    toast('Copied the commands')
  } catch {
    toast('Could not copy the commands', { description: 'Select the text and copy it instead.' })
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-10 sm:py-16">
    <header class="flex items-center justify-between gap-4">
      <span class="font-semibold">Agentic Dev Vue Starter</span>
      <a :href="repositoryUrl" class="text-sm underline underline-offset-4">GitHub</a>
    </header>

    <main class="flex flex-col gap-16">
      <section class="flex flex-col gap-6" aria-labelledby="home-title">
        <h1 id="home-title" class="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          A strict Vue starter for coding agents
        </h1>
        <p class="max-w-2xl text-lg text-(--ui-muted-foreground)">
          Every project rule is a check that runs on commit and again in CI. Agents get fast, exact
          feedback, and you review the work instead of the style.
        </p>
        <div
          class="flex flex-col gap-3 rounded-(--ui-radius) border border-(--ui-border) bg-(--ui-muted) p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <pre class="font-mono text-sm" data-testid="quick-start">{{ quickStart }}</pre>
          <Button class="self-start sm:self-auto" @click="copyQuickStart">Copy commands</Button>
        </div>
      </section>

      <section class="flex flex-col gap-6" aria-labelledby="checks-title">
        <h2 id="checks-title" class="text-2xl font-semibold">What the checks catch</h2>
        <Tabs default-value="commit">
          <TabsList aria-label="When checks run">
            <TabsTab v-for="group in checkGroups" :key="group.value" :value="group.value">
              {{ group.label }}
            </TabsTab>
          </TabsList>
          <TabsPanel v-for="group in checkGroups" :key="group.value" :value="group.value">
            <dl class="flex flex-col gap-4 pt-4 sm:gap-3">
              <div
                v-for="check in group.checks"
                :key="check.tool"
                class="grid gap-0.5 sm:grid-cols-[12rem_1fr] sm:gap-6"
              >
                <dt class="font-medium">{{ check.tool }}</dt>
                <dd class="text-(--ui-muted-foreground)">{{ check.catches }}</dd>
              </div>
            </dl>
          </TabsPanel>
        </Tabs>
      </section>

      <section class="flex flex-col gap-6" aria-labelledby="principles-title">
        <h2 id="principles-title" class="text-2xl font-semibold">How the code stays clean</h2>
        <ul class="grid gap-4 sm:grid-cols-3">
          <li
            v-for="principle in principles"
            :key="principle.title"
            class="flex flex-col gap-2 rounded-(--ui-radius) border border-(--ui-border) p-4"
          >
            <h3 class="font-semibold">{{ principle.title }}</h3>
            <p class="text-sm text-(--ui-muted-foreground)">{{ principle.body }}</p>
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-6" aria-labelledby="stack-title">
        <h2 id="stack-title" class="text-2xl font-semibold">The stack</h2>
        <ul class="flex flex-wrap gap-2">
          <li
            v-for="item in stack"
            :key="item"
            class="rounded-full border border-(--ui-border) px-3 py-1 text-sm"
          >
            {{ item }}
          </li>
        </ul>
      </section>
    </main>

    <footer class="border-t border-(--ui-border) pt-6 text-sm text-(--ui-muted-foreground)">
      Agents read
      <a :href="`${repositoryUrl}/blob/main/AGENTS.md`" class="underline underline-offset-4"
        >AGENTS.md</a
      >
      before they change code.
    </footer>
  </div>
</template>
