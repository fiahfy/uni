<template>
  <sticky-data-table
    ref="table"
    class="chart-table"
    :headers="headers"
    :items="items"
    item-key="name"
    hide-actions
  >
    <chart-table-header-row
      slot="headers"
      slot-scope="props"
      :headers="props.headers"
    />
    <chart-table-row slot="items" slot-scope="props" :item="props.item" />
  </sticky-data-table>
</template>

<script>
import ChartTableHeaderRow from './ChartTableHeaderRow'
import ChartTableRow from './ChartTableRow'
import StickyDataTable from './StickyDataTable'
import { mapGetters } from 'vuex'

export default {
  components: {
    ChartTableHeaderRow,
    ChartTableRow,
    StickyDataTable
  },
  data() {
    return {
      headers: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Size',
          value: 'value',
          width: 128
        }
      ]
    }
  },
  computed: {
    ...mapGetters('local', ['items'])
  }
}
</script>
