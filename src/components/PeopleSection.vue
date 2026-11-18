<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { Field, FieldError, FieldLabel } from '@ui-sdk/vue/field'
import { Input } from '@ui-sdk/vue/input'
import { ref } from 'vue'
import { useLedgerStore } from '@/stores/ledger'

const store = useLedgerStore()
const name = ref('')
const error = ref('')

const submit = () => {
  const result = store.addPerson(name.value)
  error.value = result.ok ? '' : result.error
  if (result.ok) name.value = ''
}
</script>

<template>
  <section aria-labelledby="people-heading" class="flex flex-col gap-3">
    <h2 id="people-heading" class="text-xl font-semibold">People</h2>
    <form class="flex flex-wrap items-end gap-3" novalidate @submit.prevent="submit">
      <Field :invalid="error !== ''" class="grow">
        <FieldLabel>Person name</FieldLabel>
        <Input v-model="name" autocomplete="off" />
        <FieldError>{{ error }}</FieldError>
      </Field>
      <Button type="submit">Add person</Button>
    </form>
    <ul v-if="store.people.length > 0" class="flex flex-col gap-2">
      <li
        v-for="person in store.people"
        :key="person.id"
        class="flex items-center justify-between gap-3 rounded border border-(--ui-border) p-3"
      >
        <span>{{ person.name }}</span>
        <span v-if="store.isInvolved(person.id)" class="text-sm text-(--ui-muted-foreground)">
          Part of an expense
        </span>
        <Button v-else @click="store.removePerson(person.id)">
          Remove <span class="sr-only">{{ person.name }}</span>
        </Button>
      </li>
    </ul>
    <p v-else>Nobody is in the group yet. Add a person to start.</p>
  </section>
</template>
