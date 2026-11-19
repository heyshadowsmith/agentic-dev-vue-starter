import {
  createColorScheme,
  createLocalStorage,
  type ColorSchemeValue,
  type PreferenceLike,
} from '@ui-sdk/core'

export const colorScheme = createColorScheme({
  storage: createLocalStorage('color-scheme'),
  global: true,
})

export const colorSchemes: readonly ColorSchemeValue[] = ['system', 'light', 'dark']

export const isColorScheme = (value: unknown): value is ColorSchemeValue =>
  colorSchemes.includes(value as ColorSchemeValue)

export const pagePreferences: readonly PreferenceLike[] = [colorScheme as PreferenceLike]
