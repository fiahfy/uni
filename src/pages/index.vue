<template>
  <v-container class="index" fluid pa-0>
    <div class="d-flex flex-column fill-height flex-grow-1 overflow-hidden">
      <toolbar />
      <alert-bar />
      <chart-graph ref="graph" class="flex-grow-1" />
      <chart-info-card />
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import AlertBar from '~/components/AlertBar.vue'
import ChartGraph from '~/components/ChartGraph.vue'
import ChartInfoCard from '~/components/ChartInfoCard.vue'
import Toolbar from '~/components/Toolbar.vue'

export default defineComponent({
  components: {
    AlertBar,
    ChartGraph,
    ChartInfoCard,
    Toolbar,
  },
  setup(_props: {}) {
    return {}
  },
})
</script>
