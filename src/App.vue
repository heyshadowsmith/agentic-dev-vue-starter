<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toast, ToastClose, ToastDescription, ToastRegion, ToastTitle } from '@ui-sdk/vue/toast'
</script>

<template>
  <RouterView />
  <ToastRegion data-agent-hidden>
    <Toast>
      <ToastTitle />
      <ToastDescription />
      <ToastClose aria-label="Dismiss" />
    </Toast>
  </ToastRegion>
</template>
