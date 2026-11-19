<script setup lang="ts">
import ColorSchemeControl from '@/components/ColorSchemeControl.vue'
import CommandMenu from './CommandMenu.vue'
import { sections } from '@/home/content'
import GithubLink from './GithubLink.vue'
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
      <div class="ml-auto flex flex-wrap items-center gap-2">
        <ColorSchemeControl />
        <CommandMenu />
        <GithubLink />
      </div>
    </div>
  </header>
</template>
