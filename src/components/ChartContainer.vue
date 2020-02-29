<template>
  <v-layout class="chart-container" column>
    <template v-if="!message">
      <v-layout row fill-height>
        <v-flex xs8>
          <chart-graph ref="graph" class="fill-height" />
        </v-flex>
        <!-- <v-flex xs4>
          <v-layout row fill-height>
            <v-divider vertical />
            <chart-table
              @click:row="onRowClick"
              @mouseover:row="onRowMouseOver"
              @mouseleave:row="onRowMouseLeave"
            />
          </v-layout>
        </v-flex> -->
      </v-layout>
      <!-- <chart-info-card @click:chip="onChipClick" /> -->
    </template>
    <v-layout v-else align-center justify-center>
      <v-flex class="text-xs-center caption">{{ message }}</v-flex>
    </v-layout>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import { scannerStore } from '~/store'
import ChartGraph from '~/components/ChartGraph.vue'
// import ChartInfoCard from '~/components/ChartInfoCard.vue'
// import ChartTable from '~/components/ChartTable.vue'

@Component({
  components: {
    ChartGraph,
    // ChartInfoCard,
    // ChartTable
  }
})
export default class ChartContainer extends Vue {
  @Ref() readonly graph!: ChartGraph

  get message() {
    switch (scannerStore.status) {
      case 'NOT_YET':
        return 'No Data'
      case 'PROGRESS':
        return scannerStore.totalSize ? null : 'Scanning...'
      default:
        return null
    }
  }

  onRowClick(item: any) {
    this.graph.moveTo(item)
  }

  onRowMouseOver(item: any) {
    this.graph.hover(item)
  }

  onRowMouseLeave(item: any) {
    this.graph.unhover(item)
  }

  onChipClick(index: any) {
    this.graph.changeDepth(index)
  }
}
</script>
