import type { Result } from '@/core/library'

export const parseJson = (text: string): Result<unknown> => {
  try {
    return { ok: true, value: JSON.parse(text) as unknown }
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' }
  }
}
