<script setup lang="ts">
import { Field, FieldLabel } from '@ui-sdk/vue/field'
import { Input, InputClear, InputGroup } from '@ui-sdk/vue/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from '@ui-sdk/vue/select'
import { Toggle, ToggleGroup } from '@ui-sdk/vue/toggle'
import { isSortOrder } from '@/core/query'
import { useListFilters } from '@/stores/list-filters'

defineProps<{ availableTags: readonly string[] }>()

const filters = useListFilters()

const sortOptions = [
  { value: 'recent', label: 'Recently used' },
  { value: 'most-used', label: 'Most used' },
  { value: 'title', label: 'Title' },
]

const changeSort = (value: unknown) => {
  if (isSortOrder(value)) filters.sort = value
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-end gap-3">
      <Field class="min-w-48 flex-1">
        <FieldLabel>Search</FieldLabel>
        <InputGroup>
          <Input
            v-model="filters.text"
            type="search"
            placeholder="Title, text or tag"
            autocomplete="off"
          />
          <InputClear aria-label="Clear search" />
        </InputGroup>
      </Field>
      <Field class="w-44">
        <FieldLabel>Sort by</FieldLabel>
        <Select :items="sortOptions" :value="filters.sort" @value-change="changeSort">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
              <SelectItemIndicator />
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
    <ToggleGroup
      v-if="availableTags.length > 0"
      v-model="filters.tags"
      multiple
      aria-label="Filter by tag"
      class="flex flex-wrap gap-2"
    >
      <Toggle
        v-for="tag in availableTags"
        :key="tag"
        :value="tag"
        :aria-label="tag"
        class="h-7 rounded-full text-xs data-pressed:border-(--ui-primary) data-pressed:bg-(--ui-primary) data-pressed:text-(--ui-primary-foreground)"
      >
        {{ tag }}
      </Toggle>
    </ToggleGroup>
  </div>
</template>
