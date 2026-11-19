<script setup lang="ts">
import { ref } from 'vue'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
} from '@ui-sdk/vue/command'
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
} from '@ui-sdk/vue/dialog'
import { copyText } from '@/lib/clipboard'
import { colorScheme, colorSchemes, isColorScheme } from '@/lib/color-scheme'
import { goToSection, sectionHeading } from '@/lib/sections'
import { quickStart, repositoryUrl, sections } from '@/home/content'
import { usePromptStore } from '@/stores/prompt'

const open = ref(false)
const focusTarget = ref<HTMLElement | null>(null)
const store = usePromptStore()

const actions: Readonly<Record<string, () => unknown>> = {
  'copy:commands': () => copyText(quickStart, 'commands'),
  'copy:prompt': () => copyText(store.prompt, 'prompt'),
  'open:github': () => window.open(repositoryUrl, '_blank', 'noopener'),
}

const run = async (value: string) => {
  const [kind, target = ''] = value.split(':', 2)
  focusTarget.value = kind === 'section' ? sectionHeading(target) : null
  open.value = false
  if (kind === 'section') goToSection(target)
  if (kind === 'scheme' && isColorScheme(target)) colorScheme.set(target)
  await actions[value]?.()
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger shortcut="mod+k" class="gap-2 text-xs uppercase">
      Menu
      <DialogShortcut class="text-(--ui-muted-foreground)" />
    </DialogTrigger>
    <DialogBackdrop />
    <DialogContent
      class="w-[min(34rem,calc(100vw-2rem))] font-mono"
      :final-focus="() => focusTarget"
    >
      <DialogTitle class="mb-2 text-xs font-bold tracking-widest uppercase"
        >Command menu</DialogTitle
      >
      <Command class="w-full" @action="run">
        <CommandInput aria-label="Search commands" placeholder="Type a command…" />
        <CommandEmpty class="p-3 text-xs">No command matches.</CommandEmpty>
        <CommandList class="max-h-80 overflow-y-auto">
          <CommandGroup>
            <CommandGroupLabel>Go to</CommandGroupLabel>
            <CommandItem
              v-for="section in sections"
              :key="section.id"
              :value="`section:${section.id}`"
            >
              {{ section.index }} {{ section.title }}
            </CommandItem>
          </CommandGroup>
          <CommandGroup>
            <CommandGroupLabel>Actions</CommandGroupLabel>
            <CommandItem value="copy:commands">Copy quick start commands</CommandItem>
            <CommandItem value="copy:prompt">Copy agent prompt</CommandItem>
            <CommandItem value="open:github">Open the repository on GitHub</CommandItem>
          </CommandGroup>
          <CommandGroup>
            <CommandGroupLabel>Color scheme</CommandGroupLabel>
            <CommandItem v-for="scheme in colorSchemes" :key="scheme" :value="`scheme:${scheme}`">
              Use {{ scheme }} colors
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>
</template>
