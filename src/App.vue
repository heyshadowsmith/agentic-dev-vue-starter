<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Toast, ToastClose, ToastDescription, ToastRegion, ToastTitle } from '@ui-sdk/vue/toast'
import QuickSwitcher from './components/QuickSwitcher.vue'
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <RouterLink to="/" class="text-lg font-semibold no-underline">Prompt Library</RouterLink>
      <QuickSwitcher />
    </header>
    <main>
      <RouterView />
    </main>
  </div>
  <ToastRegion>
    <Toast>
      <ToastTitle />
      <ToastDescription />
      <ToastClose aria-label="Dismiss" />
    </Toast>
  </ToastRegion>
</template>
