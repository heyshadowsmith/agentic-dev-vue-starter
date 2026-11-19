<script setup lang="ts">
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from '@ui-sdk/vue/segmented-control'
import { usePreference } from '@ui-sdk/vue/preferences'
import { colorScheme, colorSchemes, isColorScheme } from '@/lib/color-scheme'

const scheme = usePreference(colorScheme)

const choose = (value: unknown) => {
  if (isColorScheme(value)) colorScheme.set(value)
}
</script>

<template>
  <SegmentedControl
    aria-label="Color scheme"
    :model-value="scheme.value"
    class="text-xs uppercase"
    @value-change="choose"
  >
    <SegmentedControlIndicator />
    <SegmentedControlItem v-for="value in colorSchemes" :key="value" :value="value">
      {{ value }}
    </SegmentedControlItem>
  </SegmentedControl>
</template>
