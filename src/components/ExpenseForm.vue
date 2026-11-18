<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { Checkbox, CheckboxGroup, CheckboxIndicator } from '@ui-sdk/vue/checkbox'
import { Field, FieldDescription, FieldLabel } from '@ui-sdk/vue/field'
import { Input } from '@ui-sdk/vue/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from '@ui-sdk/vue/select'
import { ref } from 'vue'
import { useLedgerStore } from '@/stores/ledger'

const store = useLedgerStore()
const description = ref('')
const amount = ref('')
const paidBy = ref<string | null>(null)
const splitAmong = ref<string[]>([])
const error = ref<string | undefined>()

function add() {
  error.value = store.addExpense({
    description: description.value,
    amount: amount.value,
    paidBy: paidBy.value,
    splitAmong: splitAmong.value,
  })
  if (error.value !== undefined) return
  description.value = ''
  amount.value = ''
  paidBy.value = null
  splitAmong.value = []
}
</script>

<template>
  <section aria-labelledby="expense-heading" class="flex flex-col gap-3">
    <h2 id="expense-heading" class="text-lg font-semibold">Add an expense</h2>
    <p v-if="store.people.length === 0" class="text-neutral-600 dark:text-neutral-400">
      Add people first.
    </p>
    <form v-else class="flex flex-col gap-3" @submit.prevent="add">
      <Field>
        <FieldLabel>Description</FieldLabel>
        <Input v-model:value="description" autocomplete="off" />
      </Field>
      <Field>
        <FieldLabel>Amount</FieldLabel>
        <Input v-model:value="amount" inputmode="decimal" autocomplete="off" />
        <FieldDescription>In dollars, for example 12.50.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Paid by</FieldLabel>
        <Select v-model:value="paidBy" placeholder="Choose a person">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="person in store.people" :key="person.id" :value="person.id">
              {{ person.name }}
              <SelectItemIndicator />
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Split among</FieldLabel>
        <CheckboxGroup v-model:value="splitAmong" class="flex flex-wrap gap-4">
          <label v-for="person in store.people" :key="person.id" class="flex items-center gap-2">
            <Checkbox :value="person.id">
              <CheckboxIndicator />
            </Checkbox>
            {{ person.name }}
          </label>
        </CheckboxGroup>
      </Field>
      <p v-if="error" role="alert" class="text-red-700 dark:text-red-400">{{ error }}</p>
      <div>
        <Button type="submit" data-variant="solid">Add expense</Button>
      </div>
    </form>
  </section>
</template>
