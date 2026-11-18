<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { Field, FieldLabel } from '@ui-sdk/vue/field'
import { Input } from '@ui-sdk/vue/input'
import { ref } from 'vue'
import { useLedgerStore } from '@/stores/ledger'

const store = useLedgerStore()
const name = ref('')
const error = ref<string | undefined>()

function add() {
  error.value = store.addPerson(name.value)
  if (error.value === undefined) name.value = ''
}

function remove(personId: string) {
  error.value = store.removePerson(personId)
}
</script>

<template>
  <section aria-labelledby="people-heading" class="flex flex-col gap-3">
    <h2 id="people-heading" class="text-lg font-semibold">People</h2>
    <form class="flex flex-wrap items-end gap-2" @submit.prevent="add">
      <Field class="grow">
        <FieldLabel>Person name</FieldLabel>
        <Input v-model:value="name" autocomplete="off" />
      </Field>
      <Button type="submit" data-variant="solid">Add person</Button>
    </form>
    <p v-if="error" role="alert" class="text-red-700 dark:text-red-400">{{ error }}</p>
    <p v-if="store.people.length === 0" class="text-neutral-600 dark:text-neutral-400">
      Add the people who share costs.
    </p>
    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="person in store.people"
        :key="person.id"
        class="flex items-center justify-between gap-2"
      >
        <span>{{ person.name }}</span>
        <span class="flex items-center gap-2">
          <span
            v-if="store.isInvolved(person.id)"
            class="text-sm text-neutral-600 dark:text-neutral-400"
          >
            In an expense
          </span>
          <Button :disabled="store.isInvolved(person.id)" @click="remove(person.id)">
            Remove <span class="sr-only">{{ person.name }}</span>
          </Button>
        </span>
      </li>
    </ul>
  </section>
</template>
