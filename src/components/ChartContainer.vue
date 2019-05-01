<template>
  <v-layout class="chart-container" column>
    <template v-if="!message">
      <v-layout row fill-height>
        <v-flex xs8>
          <chart-graph ref="graph" class="fill-height" />
        </v-flex>
        <v-flex xs4>
          <v-layout row fill-height>
            <v-divider vertical />
            <chart-table
              @click:row="onRowClick"
              @mouseover:row="onRowMouseOver"
              @mouseleave:row="onRowMouseLeave"
            />
          </v-layout>
        </v-flex>
      </v-layout>
      <!-- <v-divider /> -->
      <chart-info-card @click:chip="onChipClick" />
    </template>
    <v-layout v-else align-center justify-center>
      <v-flex class="text-xs-center caption">{{ message }}</v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import status from '~/consts/status'
import ChartGraph from '~/components/ChartGraph'
import ChartInfoCard from '~/components/ChartInfoCard'
import ChartTable from '~/components/ChartTable'

export default {
  components: {
    ChartGraph,
    ChartInfoCard,
    ChartTable
  },
  computed: {
    message() {
      switch (this.status) {
        case status.NOT_YET:
          return 'No Data'
        case status.PROGRESS:
          return this.totalSize ? null : 'Scanning...'
        default:
          return null
      }
    },
    ...mapState('local', ['status']),
    ...mapGetters('local', ['totalSize'])
  },
  methods: {
    onRowClick(item) {
      this.$refs.graph.moveTo(item)
    },
    onRowMouseOver(item) {
      this.$refs.graph.hover(item)
    },
    onRowMouseLeave(item) {
      this.$refs.graph.unhover(item)
    },
    onChipClick(index) {
      this.$refs.graph.changeDepth(index)
    }
  }
}
</script>
