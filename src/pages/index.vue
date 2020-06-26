<template>
  <v-container class="index" fluid pa-0>
    <div class="d-flex flex-column fill-height flex-grow-1 overflow-hidden">
      <toolbar />
      <template v-if="data">
        <chart-card
          :selected-paths="state.selectedPaths"
          :hovered-paths="state.hoveredPaths"
          @click:chip="handleClickChip"
        />
        <v-row no-gutters class="overflow-hidden">
          <v-col cols="8" class="fill-height">
            <chart-graph
              ref="graph"
              class="fill-height overflow-hidden"
              :selected-paths="state.selectedPaths"
              :hovered-paths="state.hoveredPaths"
              @change:selected-paths="handleChangeSelectedPaths"
              @change:hovered-paths="handleChangeHoveredPaths"
              @change:color-category="handleChangeColorCategory"
            />
          </v-col>
          <v-col cols="4" class="fill-height">
            <chart-table
              class="fill-height overflow-hidden"
              :selected-paths="state.selectedPaths"
              :color-category="state.colorCategory"
              @click:row="handleClickRow"
              @mouseover:row="handleMouseOverRow"
              @mouseleave:row="handleMouseLeaveRow"
            />
          </v-col>
        </v-row>
      </template>
      <div v-else class="fill-height d-flex align-center justify-center">
        <div class="body-2" v-text="message" />
      </div>
      <status-bar />
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from '@vue/composition-api'
import ChartCard from '~/components/ChartCard.vue'
import ChartGraph from '~/components/ChartGraph.vue'
import ChartTable from '~/components/ChartTable.vue'
import StatusBar from '~/components/StatusBar.vue'
import Toolbar from '~/components/Toolbar.vue'
import { Node } from '~/models'
import { scannerStore } from '~/store'

export default defineComponent({
  components: {
    ChartCard,
    ChartGraph,
    ChartTable,
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

    const data = computed(() => scannerStore.data)
    const message = computed(() => {
      return scannerStore.scanning ? 'Scanning...' : 'No data available'
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
    const handleClickRow = (item: Node) => {
      graph.value && graph.value.moveTo(item)
    }
    const handleMouseOverRow = (item: Node) => {
      graph.value && graph.value.hover(item)
    }
    const handleMouseLeaveRow = (_item: Node) => {
      graph.value && graph.value.unhover()
    }

    scannerStore.initialize()

    return {
      state,
      data,
      message,
      graph,
      handleClickChip,
      handleChangeSelectedPaths,
      handleChangeHoveredPaths,
      handleChangeColorCategory,
      handleClickRow,
      handleMouseOverRow,
      handleMouseLeaveRow,
    }
  },
})
</script>
