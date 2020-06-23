<template>
  <v-container class="index" fluid pa-0>
    <div class="d-flex flex-column fill-height flex-grow-1 overflow-hidden">
      <toolbar />
      <chart-card />
      <chart-graph ref="graph" class="flex-grow-1 overflow-hidden" />
      <status-bar />
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
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
    scannerStore.initialize()

    return {}
  },
})
</script>
