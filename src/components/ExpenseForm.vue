<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@ui-sdk/vue/button'
import { Checkbox, CheckboxGroup, CheckboxIndicator } from '@ui-sdk/vue/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from '@ui-sdk/vue/field'
import { Input } from '@ui-sdk/vue/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-sdk/vue/select'
import { maxDescriptionLength, type ExpenseErrors } from '@/core/ledger'
import { useSplitterStore } from '@/stores/splitter'

const store = useSplitterStore()

const description = ref('')
const amount = ref('')
const payerId = ref<string | null>(null)
const participantIds = ref<string[]>([])
const errors = ref<ExpenseErrors | null>(null)

const payerItems = computed(() =>
  store.people.map((person) => ({ value: person.id, label: person.name })),
)

const submit = () => {
  const result = store.addExpense({
    description: description.value,
    amountText: amount.value,
    payerId: payerId.value,
    participantIds: participantIds.value,
  })
  errors.value = result.ok ? null : result.error
  if (!result.ok) return
  description.value = ''
  amount.value = ''
  payerId.value = null
  participantIds.value = []
}
</script>

<template>
  <section aria-labelledby="expense-form-heading" class="flex flex-col gap-3">
    <h2 id="expense-form-heading" class="text-lg font-semibold">Add an expense</h2>
    <p v-if="store.people.length === 0">Add people before you add an expense.</p>
    <form v-else class="flex flex-col gap-4" @submit.prevent="submit">
      <Field :invalid="Boolean(errors?.description)">
        <FieldLabel>Description</FieldLabel>
        <Input v-model="description" autocomplete="off" :maxlength="maxDescriptionLength" />
        <FieldError match>{{ errors?.description }}</FieldError>
      </Field>
      <Field :invalid="Boolean(errors?.amount)">
        <FieldLabel>Amount</FieldLabel>
        <Input v-model="amount" inputmode="decimal" autocomplete="off" placeholder="0.00" />
        <FieldDescription>In dollars and cents, for example 12.50.</FieldDescription>
        <FieldError match>{{ errors?.amount }}</FieldError>
      </Field>
      <Field :invalid="Boolean(errors?.payer)">
        <FieldLabel>Paid by</FieldLabel>
        <Select v-model:value="payerId" :items="payerItems" placeholder="Choose a person">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="item in payerItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FieldError match>{{ errors?.payer }}</FieldError>
      </Field>
      <Field :invalid="Boolean(errors?.participants)">
        <FieldLabel>Split among</FieldLabel>
        <CheckboxGroup v-model:value="participantIds" class="flex flex-col gap-1">
          <label v-for="person in store.people" :key="person.id" class="flex items-center gap-2">
            <Checkbox :value="person.id">
              <CheckboxIndicator />
            </Checkbox>
            {{ person.name }}
          </label>
        </CheckboxGroup>
        <FieldError match>{{ errors?.participants }}</FieldError>
      </Field>
      <Button type="submit" class="self-start">Add expense</Button>
    </form>
  </section>
</template>
