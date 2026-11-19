<script setup lang="ts">
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@ui-sdk/vue/accordion'
import { questions } from '@/home/content'
import SectionHeading from './SectionHeading.vue'
</script>

<template>
  <section aria-labelledby="questions" class="flex flex-col gap-4">
    <SectionHeading id="questions" index="05" title="Why so strict" />
    <Accordion aria-label="Questions" class="max-w-none! border-t border-(--ui-foreground)">
      <AccordionItem v-for="item in questions" :key="item.id" :value="item.id">
        <AccordionHeader>
          <AccordionTrigger>{{ item.question }}</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          <p class="max-w-2xl text-(--ui-muted-foreground)">{{ item.answer }}</p>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  </section>
</template>
