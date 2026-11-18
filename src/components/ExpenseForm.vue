<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { Checkbox, CheckboxGroup, CheckboxIndicator } from '@ui-sdk/vue/checkbox'
import { Field, FieldDescription, FieldLabel } from '@ui-sdk/vue/field'
import { Input } from '@ui-sdk/vue/input'
import {
  Select as PayerSelect,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from '@ui-sdk/vue/select'
import { computed, ref, watch } from 'vue'
import { useLedgerStore } from '@/stores/ledger'

const store = useLedgerStore()
const description = ref('')
const amount = ref('')
const payerId = ref<string>()
const participantIds = ref<string[]>(store.people.map((person) => person.id))
const error = ref('')

const payerItems = computed(() =>
  store.people.map((person) => ({ value: person.id, label: person.name })),
)

watch(
  () => store.people.map((person) => person.id),
  (personIds) => {
    participantIds.value = personIds
  },
)

const submit = () => {
  const result = store.addExpense({
    description: description.value,
    amount: amount.value,
    payerId: payerId.value,
    participantIds: participantIds.value,
  })
  error.value = result.ok ? '' : result.error
  if (!result.ok) return
  description.value = ''
  amount.value = ''
}
</script>

<template>
  <section aria-labelledby="add-expense-heading" class="flex flex-col gap-3">
    <h2 id="add-expense-heading" class="text-xl font-semibold">Add an expense</h2>
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <div class="flex flex-wrap gap-3">
        <Field class="grow">
          <FieldLabel>Description</FieldLabel>
          <Input v-model="description" autocomplete="off" />
        </Field>
        <Field>
          <FieldLabel>Amount in dollars</FieldLabel>
          <Input v-model="amount" inputmode="decimal" placeholder="0.00" autocomplete="off" />
        </Field>
        <Field>
          <FieldLabel>Paid by</FieldLabel>
          <PayerSelect
            :items="payerItems"
            placeholder="Choose a person"
            @value-change="(value) => (payerId = value ?? undefined)"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="item in payerItems" :key="item.value" :value="item.value">
                {{ item.label }}
                <SelectItemIndicator />
              </SelectItem>
            </SelectContent>
          </PayerSelect>
        </Field>
      </div>
      <Field>
        <FieldLabel>Split equally among</FieldLabel>
        <FieldDescription>
          Leftover cents go to the first people in the list, one cent each.
        </FieldDescription>
        <CheckboxGroup v-model:value="participantIds" class="flex flex-wrap gap-4">
          <label
            v-for="person in store.people"
            :key="person.id"
            :for="`split-${person.id}`"
            class="flex items-center gap-2"
          >
            <Checkbox :id="`split-${person.id}`" :value="person.id">
              <CheckboxIndicator />
            </Checkbox>
            {{ person.name }}
          </label>
        </CheckboxGroup>
      </Field>
      <p v-if="error !== ''" role="alert" class="text-(--ui-destructive)">{{ error }}</p>
      <div>
        <Button type="submit">Add expense</Button>
      </div>
    </form>
  </section>
</template>
