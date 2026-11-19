<script setup lang="ts">
import { stack } from '@/home/content'
import SectionHeading from './SectionHeading.vue'
</script>

<template>
  <section aria-labelledby="stack" class="flex flex-col gap-4">
    <SectionHeading id="stack" index="06" title="Stack" />
    <table class="w-full border-collapse text-left">
      <thead class="text-xs text-(--ui-muted-foreground) uppercase">
        <tr>
          <th scope="col" class="border-b border-(--ui-foreground) py-1.5 pr-4 font-normal">
            Tool
          </th>
          <th scope="col" class="border-b border-(--ui-foreground) py-1.5 font-normal">Role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in stack" :key="item.name">
          <th scope="row" class="border-b border-(--ui-border) py-1.5 pr-4 font-bold">
            {{ item.name }}
          </th>
          <td class="border-b border-(--ui-border) py-1.5">{{ item.role }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
