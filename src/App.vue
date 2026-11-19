<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Preferences } from '@ui-sdk/vue/preferences'
import { Toast, ToastClose, ToastDescription, ToastRegion, ToastTitle } from '@ui-sdk/vue/toast'
import { pagePreferences } from '@/lib/color-scheme'
</script>

<template>
  <Preferences :preferences="pagePreferences">
    <RouterView />
    <ToastRegion data-agent-hidden>
      <Toast>
        <ToastTitle />
        <ToastDescription />
        <ToastClose aria-label="Dismiss" />
      </Toast>
    </ToastRegion>
  </Preferences>
</template>
