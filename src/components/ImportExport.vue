<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@ui-sdk/vue/alert-dialog'
import { Button } from '@ui-sdk/vue/button'
import { FileInput, FileInputTrigger } from '@ui-sdk/vue/file-input'
import { toast } from '@ui-sdk/vue/toast'
import { decodeLibrary, encodeLibrary, planImport } from '@/core/library'
import type { ImportPlan } from '@/core/library'
import { downloadJson, today } from '@/lib/browser'
import { parseJson } from '@/lib/json'
import { usePromptStore } from '@/stores/prompts'

const maxFileSize = 5_000_000

const store = usePromptStore()
const noFiles: File[] = []
const plan = ref<ImportPlan | null>(null)
const confirmOpen = ref(false)

const addedCount = computed(() => plan.value?.toAdd.length ?? 0)
const skippedCount = computed(() => plan.value?.skipped ?? 0)
const plural = (count: number) => `${count} ${count === 1 ? 'prompt' : 'prompts'}`

const exportPrompts = () => {
  downloadJson(`prompt-library-${today()}.json`, encodeLibrary(store.prompts))
}

const fail = (description: string) => {
  toast.error('Could not import the file', { description })
}

const readFile = async (file: File) => {
  const parsed = parseJson(await file.text())
  const decoded = parsed.ok ? decodeLibrary(parsed.value) : parsed
  if (!decoded.ok) {
    fail(decoded.error)
    return
  }
  plan.value = planImport(store.prompts, decoded.value)
  confirmOpen.value = true
}

const chooseFile = async (value: File[]) => {
  const file = value[0]
  if (file !== undefined) await readFile(file)
}

const rejectFile = () => {
  fail('Choose a JSON file that is smaller than 5 MB.')
}

const applyImport = () => {
  if (plan.value === null) return
  store.importPrompts(plan.value.toAdd)
  toast.success(`Imported ${plural(plan.value.toAdd.length)}`)
  plan.value = null
}
</script>

<template>
  <div class="flex gap-2">
    <FileInput
      :value="noFiles"
      accept=".json,application/json"
      :max-size="maxFileSize"
      aria-label="Import prompts from a JSON file"
      @value-change="chooseFile"
      @reject="rejectFile"
    >
      <FileInputTrigger>Import</FileInputTrigger>
    </FileInput>
    <Button @click="exportPrompts">Export</Button>
    <AlertDialog v-model:open="confirmOpen">
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogTitle>Import prompts?</AlertDialogTitle>
        <AlertDialogDescription>
          {{ plural(addedCount) }} will be added. {{ plural(skippedCount) }} will be skipped because
          a prompt with the same ID already exists.
        </AlertDialogDescription>
        <div class="mt-4 flex justify-end gap-2">
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose
            value="confirm"
            data-variant="solid"
            :disabled="addedCount === 0"
            :action="applyImport"
          >
            Import
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
