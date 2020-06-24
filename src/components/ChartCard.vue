<template>
  <v-card class="chart-card d-flex align-center px-5" tile flat>
    <div class="pr-5 subtitle-2 text-no-wrap">
      Total size: {{ totalSize | prettyBytes }}
    </div>
    <div class="flex-grow-1 overflow-x-scroll no-scrollbar">
      <div class="pa-1 text-no-wrap">
        <v-chip
          v-for="(p, index) of paths"
          :key="index"
          class="mr-1"
          @click="() => handleClickChip(index)"
        >
          {{ p }}{{ sep }}
        </v-chip>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import path from 'path'
import { defineComponent, computed, SetupContext } from '@vue/composition-api'
import { scannerStore } from '~/store'

export default defineComponent({
  setup(_props: {}, context: SetupContext) {
    const paths = computed(() => {
      return [
        scannerStore.rootPathHasNoTrailingSlash,
        ...scannerStore.selectedNames,
        ...scannerStore.hoveredNames,
      ]
    })
    const totalSize = computed(() => scannerStore.totalSize)

    const handleClickChip = (index: number) => {
      context.emit('click:chip', index)
    }

    return {
      sep: path.sep,
      paths,
      totalSize,
      handleClickChip,
    }
  },
})
</script>

<style lang="scss" scoped>
.chart-card > .no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
