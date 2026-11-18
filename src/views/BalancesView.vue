<script setup lang="ts">
import BalanceList from '@/components/BalanceList.vue'
import ExpenseForm from '@/components/ExpenseForm.vue'
import ExpenseList from '@/components/ExpenseList.vue'
import PeopleSection from '@/components/PeopleSection.vue'
</script>

<template>
  <div class="flex flex-col gap-8">
    <BalanceList />
    <PeopleSection />
    <ExpenseForm />
    <ExpenseList />
  </div>
</template>
