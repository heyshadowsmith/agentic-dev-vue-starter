<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@ui-sdk/vue/alert-dialog'
import { Button } from '@ui-sdk/vue/button'
import { toast } from '@ui-sdk/vue/toast'
import type { Prompt } from '@/core/prompts'
import { usePromptStore } from '@/stores/prompts'

const props = defineProps<{ prompt: Prompt }>()
const emit = defineEmits<{ deleted: [] }>()

const store = usePromptStore()
const router = useRouter()

const duplicate = async () => {
  const copy = store.duplicate(props.prompt.id)
  if (copy === undefined) return
  toast.success('Prompt duplicated', { description: copy.title })
  await router.push({ name: 'edit', params: { id: copy.id } })
}

const remove = () => {
  store.deletePrompt(props.prompt.id)
  toast('Prompt deleted', { description: props.prompt.title })
  emit('deleted')
}
</script>

<template>
  <Button :aria-label="`Duplicate ${prompt.title}`" @click="duplicate">Duplicate</Button>
  <AlertDialog>
    <AlertDialogTrigger data-variant="destructive" :aria-label="`Delete ${prompt.title}`">
      Delete
    </AlertDialogTrigger>
    <AlertDialogBackdrop />
    <AlertDialogContent>
      <AlertDialogTitle>Delete “{{ prompt.title }}”?</AlertDialogTitle>
      <AlertDialogDescription>
        The prompt and its use history will be removed. You cannot undo this.
      </AlertDialogDescription>
      <div class="mt-4 flex justify-end gap-2">
        <AlertDialogClose>Cancel</AlertDialogClose>
        <AlertDialogClose value="confirm" data-variant="destructive" :action="remove">
          Delete
        </AlertDialogClose>
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>
