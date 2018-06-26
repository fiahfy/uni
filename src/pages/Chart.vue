<template>
  <v-container
    class="chart"
    fill-height
    fluid
    pa-0
  >
    <v-layout column>
      <chart-alert-bar />
      <chart-toolbar />
      <v-container
        fluid
        pa-0
        overflow-hidden
      >
        <chart-graph class="fill-height" />
      </v-container>
    </v-layout>
  </v-container>
</template>

<script>
import ChartAlertBar from '~/components/ChartAlertBar'
import ChartGraph from '~/components/ChartGraph'
import ChartToolbar from '~/components/ChartToolbar'

export default {
  components: {
    ChartAlertBar,
    ChartGraph,
    ChartToolbar
  }
}
</script>
