<template>
  <v-container class="index" fluid pa-0>
    <div class="d-flex flex-column fill-height flex-grow-1 overflow-hidden">
      <toolbar />
      <chart-card
        :selected-paths="state.selectedPaths"
        :hovered-paths="state.hoveredPaths"
        @click:chip="handleClickChip"
      />
      <chart-graph
        ref="graph"
        class="flex-grow-1 overflow-hidden"
        :selected-paths="state.selectedPaths"
        :hovered-paths="state.hoveredPaths"
        @change:selected-paths="handleChangeSelectedPaths"
        @change:hovered-paths="handleChangeHoveredPaths"
        @change:color-category="handleChangeColorCategory"
      />
      <status-bar />
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from '@vue/composition-api'
import ChartCard from '~/components/ChartCard.vue'
import ChartGraph from '~/components/ChartGraph.vue'
import StatusBar from '~/components/StatusBar.vue'
import Toolbar from '~/components/Toolbar.vue'
import { scannerStore } from '~/store'

export default defineComponent({
  components: {
    ChartCard,
    ChartGraph,
    StatusBar,
    Toolbar,
  },
  setup(_props: {}) {
    const state = reactive<{
      selectedPaths: string[]
      hoveredPaths: string[]
      colorCategory: Function
    }>({
      selectedPaths: [],
      hoveredPaths: [],
      colorCategory: () => {},
    })

    const graph = ref<InstanceType<typeof ChartGraph>>()

    const handleClickChip = (index: number) => {
      graph.value && graph.value.changeDepth(index)
    }
    const handleChangeSelectedPaths = (paths: string[]) => {
      state.selectedPaths = paths
    }
    const handleChangeHoveredPaths = (paths: string[]) => {
      state.hoveredPaths = paths
    }
    const handleChangeColorCategory = (colorCategory: Function) => {
      state.colorCategory = colorCategory
    }

    scannerStore.initialize()

    return {
      state,
      graph,
      handleClickChip,
      handleChangeSelectedPaths,
      handleChangeHoveredPaths,
      handleChangeColorCategory,
    }
  },
})
</script>
