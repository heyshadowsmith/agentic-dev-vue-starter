<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@ui-sdk/vue/button'
import { Field, FieldError, FieldLabel } from '@ui-sdk/vue/field'
import { Input } from '@ui-sdk/vue/input'
import { maxNameLength } from '@/core/ledger'
import { useSplitterStore } from '@/stores/splitter'

const store = useSplitterStore()
const name = ref('')
const error = ref<string | null>(null)

const submit = () => {
  const result = store.addPerson(name.value)
  error.value = result.ok ? null : result.error
  name.value = result.ok ? '' : name.value
}

const remove = (personId: string) => {
  const result = store.removePerson(personId)
  error.value = result.ok ? null : result.error
}
</script>

<template>
  <section aria-labelledby="people-heading" class="flex flex-col gap-3">
    <h2 id="people-heading" class="text-lg font-semibold">People</h2>
    <form class="flex flex-wrap items-start gap-2" @submit.prevent="submit">
      <Field :invalid="error !== null" class="grow">
        <FieldLabel>Name</FieldLabel>
        <Input v-model="name" autocomplete="off" :maxlength="maxNameLength" />
        <FieldError match>{{ error }}</FieldError>
      </Field>
      <Button type="submit" class="mt-6">Add person</Button>
    </form>
    <p v-if="store.people.length === 0">Add the people who share the costs.</p>
    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="person in store.people"
        :key="person.id"
        class="flex flex-wrap items-center justify-between gap-2"
      >
        <span>{{ person.name }}</span>
        <span class="flex items-center gap-2">
          <span v-if="store.isInvolved(person.id)" class="text-sm">Part of an expense</span>
          <Button :disabled="store.isInvolved(person.id)" @click="remove(person.id)">
            Remove <span class="sr-only">{{ person.name }}</span>
          </Button>
        </span>
      </li>
    </ul>
  </section>
</template>
