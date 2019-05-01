<template>
  <v-layout class="chart-container" column>
    <template v-if="!message">
      <chart-graph class="fill-height" />
      <v-divider />
      <chart-info-card />
    </template>
    <v-layout v-else align-center justify-center>
      <v-flex class="text-xs-center caption">{{ message }}</v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex'
import status from '~/consts/status'
import ChartGraph from '~/components/ChartGraph'
import ChartInfoCard from '~/components/ChartInfoCard'

export default {
  components: {
    ChartGraph,
    ChartInfoCard
  },
  computed: {
    message() {
      switch (this.status) {
        case status.NOT_YET:
          return 'No Data'
        case status.PROGRESS:
          return 'Scanning...'
        default:
          return null
      }
    },
    ...mapState('local', ['status'])
  }
}
</script>
