<script setup lang="ts">
import ColorSchemeControl from '@/components/ColorSchemeControl.vue'
import CommandMenu from './CommandMenu.vue'
import { repositoryUrl, sections } from '@/home/content'
</script>

<template>
  <header class="border-b border-(--ui-foreground)">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
      <a href="/" class="font-bold tracking-tight no-underline">
        agentic-dev-vue-starter<span class="text-(--accent)">_</span>
      </a>
      <nav aria-label="Sections" class="order-last w-full lg:order-none lg:w-auto lg:flex-1">
        <ul
          class="flex flex-wrap gap-x-4 gap-y-1 text-xs whitespace-nowrap uppercase lg:flex-nowrap"
        >
          <li v-for="section in sections" :key="section.id">
            <a :href="`#${section.id}`" class="hover:text-(--accent) hover:underline">
              {{ section.title }}
            </a>
          </li>
        </ul>
      </nav>
      <div class="ml-auto flex items-center gap-2">
        <ColorSchemeControl />
        <CommandMenu />
        <a :href="repositoryUrl" class="text-xs uppercase underline underline-offset-4">GitHub</a>
      </div>
    </div>
  </header>
</template>
