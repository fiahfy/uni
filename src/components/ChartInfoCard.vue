<template>
  <v-card class="chart-info-card" tile flat>
    <v-card-title class="py-2 subtitle-2">
      Total size: {{ totalSize | prettyBytes }}
    </v-card-title>
    <v-card-actions class="pa-0 scroll-x">
      <div class="pa-2 text-no-wrap">
        <v-chip
          v-for="(p, index) of paths"
          :key="index"
          @click="() => handleChipClick(index)"
        >
          {{ p }}{{ sep }}
        </v-chip>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import path from 'path'
import { defineComponent, computed } from '@vue/composition-api'
import { scannerStore } from '~/store'

export default defineComponent({
  setup(_props: {}) {
    const paths = computed(() => {
      return [
        scannerStore.rootPathHasNoTrailingSlash,
        ...scannerStore.selectedNames,
        ...scannerStore.hoveredNames,
      ]
    })
    const totalSize = computed(() => scannerStore.totalSize)

    const handleChipClick = (_index: number) => {
      // this.$emit('click:chip', index)
    }

    return {
      sep: path.sep,
      paths,
      totalSize,
      handleChipClick,
    }
  },
})
</script>

<style lang="scss" scoped>
.chart-info-card > .v-card__actions {
  overflow-x: scroll;
}
</style>
