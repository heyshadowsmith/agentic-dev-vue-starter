import { toast } from '@ui-sdk/vue/toast'

export const copyText = async (text: string, what: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast(`Copied the ${what}`)
  } catch {
    toast(`Could not copy the ${what}`, { description: 'Select the text and copy it instead.' })
  }
}
