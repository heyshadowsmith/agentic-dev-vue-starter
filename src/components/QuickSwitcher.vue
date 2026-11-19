<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@ui-sdk/vue/command'
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
} from '@ui-sdk/vue/dialog'
import { sortPrompts } from '@/core/query'
import { usePromptStore } from '@/stores/prompts'

const store = usePromptStore()
const router = useRouter()
const open = ref(false)

const prompts = computed(() => sortPrompts(store.prompts, 'recent'))

const openPrompt = async (id: string) => {
  open.value = false
  await router.push({ name: 'use', params: { id } })
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger shortcut="mod+k">
      Find a prompt
      <DialogShortcut class="text-xs text-(--ui-muted-foreground)" />
    </DialogTrigger>
    <DialogBackdrop />
    <DialogContent class="w-[min(36rem,calc(100vw-2rem))]">
      <DialogTitle class="mb-2 font-semibold">Open a prompt</DialogTitle>
      <Command class="w-full" @action="openPrompt">
        <CommandInput aria-label="Search prompts by title" placeholder="Type a title…" />
        <CommandEmpty class="p-3 text-sm">No prompt has this title.</CommandEmpty>
        <CommandList class="max-h-80 overflow-y-auto">
          <CommandItem v-for="prompt in prompts" :key="prompt.id" :value="prompt.id">
            {{ prompt.title }}
          </CommandItem>
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>
</template>
