<script setup lang="ts">
import BalanceList from '@/components/BalanceList.vue'
import ExpenseForm from '@/components/ExpenseForm.vue'
import ExpenseList from '@/components/ExpenseList.vue'
import PeopleSection from '@/components/PeopleSection.vue'
</script>

<template>
  <PeopleSection />
  <ExpenseForm />
  <BalanceList />
  <ExpenseList />
</template>
