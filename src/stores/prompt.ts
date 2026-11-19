import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { buildPrompt, type ChangeKind, type PromptOptions } from '@/core/prompt'

export type PromptFlag = 'testsFirst' | 'pureCore' | 'askBeforeDependencies' | 'openPullRequest'

export const usePromptStore = defineStore('prompt', () => {
  const task = ref('')
  const kind = ref<ChangeKind>('feat')
  const flags = ref<Record<PromptFlag, boolean>>({
    testsFirst: true,
    pureCore: true,
    askBeforeDependencies: true,
    openPullRequest: false,
  })

  const options = computed<PromptOptions>(() => ({
    task: task.value,
    kind: kind.value,
    ...flags.value,
  }))
  const prompt = computed(() => buildPrompt(options.value))

  const setFlag = (flag: PromptFlag, isOn: boolean) => {
    flags.value = { ...flags.value, [flag]: isOn }
  }

  return { task, kind, flags, prompt, setFlag }
})
