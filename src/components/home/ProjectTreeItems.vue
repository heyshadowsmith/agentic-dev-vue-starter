<script setup lang="ts">
import { TreeGroup, TreeItem, TreeItemIndicator, TreeItemLabel } from '@ui-sdk/vue/tree'
import type { ProjectNode } from '@/home/project'

defineProps<{ items: ProjectNode[] }>()
</script>

<template>
  <TreeItem v-for="item in items" :key="item.value" :value="item.value">
    <TreeItemLabel class="gap-2">
      <TreeItemIndicator v-if="item.children" />
      <span :class="item.layer === 'core' ? 'font-bold text-(--accent)' : ''">{{
        item.label
      }}</span>
    </TreeItemLabel>
    <TreeGroup v-if="item.children">
      <ProjectTreeItems :items="item.children" />
    </TreeGroup>
  </TreeItem>
</template>
