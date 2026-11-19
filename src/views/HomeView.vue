<script setup lang="ts">
import CheckExplorer from '@/components/home/CheckExplorer.vue'
import HeroPanel from '@/components/home/HeroPanel.vue'
import PipelineRun from '@/components/home/PipelineRun.vue'
import ProjectMap from '@/components/home/ProjectMap.vue'
import PromptBuilder from '@/components/home/PromptBuilder.vue'
import QuestionList from '@/components/home/QuestionList.vue'
import SiteHeader from '@/components/home/SiteHeader.vue'
import StackTable from '@/components/home/StackTable.vue'
import { repositoryUrl } from '@/home/content'
</script>

<template>
  <SiteHeader />
  <main class="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10 sm:py-14">
    <HeroPanel />
    <PromptBuilder />
    <CheckExplorer />
    <PipelineRun />
    <ProjectMap />
    <QuestionList />
    <StackTable />
  </main>
  <footer class="border-t border-(--ui-foreground)">
    <div
      class="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 text-xs text-(--ui-muted-foreground) uppercase"
    >
      <span>Agents read AGENTS.md before they change code.</span>
      <a :href="`${repositoryUrl}/blob/main/AGENTS.md`" class="underline underline-offset-4"
        >Read AGENTS.md</a
      >
    </div>
  </footer>
</template>
