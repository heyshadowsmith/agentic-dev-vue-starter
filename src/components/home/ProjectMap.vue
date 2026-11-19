<script setup lang="ts">
import { computed, ref } from 'vue'
import { Tree } from '@ui-sdk/vue/tree'
import { findNode } from '@/core/tree'
import { layerNames, projectTree } from '@/home/project'
import ProjectTreeItems from './ProjectTreeItems.vue'
import SectionHeading from './SectionHeading.vue'

const selected = ref<string | null>('src/core')
const node = computed(() => findNode(projectTree, selected.value))

const select = (value: unknown) => {
  if (typeof value === 'string') selected.value = value
}
</script>

<template>
  <section aria-labelledby="project" class="flex flex-col gap-4">
    <SectionHeading id="project" index="04" title="Project map" />
    <p class="max-w-2xl text-(--ui-muted-foreground)">
      Pure logic in src/core, side effects in the shell. Select a path to see what belongs there.
    </p>
    <div class="grid border border-(--ui-foreground) md:grid-cols-[20rem_1fr]">
      <Tree
        :value="selected"
        aria-label="Project files"
        :items="projectTree"
        :default-expanded="['src', 'src/core']"
        class="border-b border-(--ui-foreground) p-2 md:border-r md:border-b-0"
        @value-change="select"
      >
        <ProjectTreeItems :items="projectTree" />
      </Tree>
      <div class="flex flex-col gap-3 p-4" aria-live="polite">
        <template v-if="node">
          <p class="text-xs text-(--ui-muted-foreground) uppercase">
            {{ layerNames[node.layer] }}
          </p>
          <p class="text-lg font-bold break-all">{{ node.value }}</p>
          <p>{{ node.note }}</p>
        </template>
        <p v-else class="text-(--ui-muted-foreground)">Select a path.</p>
      </div>
    </div>
  </section>
</template>
