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
    <chart-table-row
      slot="items"
      slot-scope="props"
      :item="props.item"
      @click="onRowClick"
      @mouseover="onRowMouseOver"
      @mouseleave="onRowMouseLeave"
    />
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
          width: 150
        }
      ]
    }
  },
  computed: {
    ...mapGetters('local', ['items'])
  },
  methods: {
    onRowClick(item) {
      this.$emit('click:row', item)
    },
    onRowMouseOver(item) {
      this.$emit('mouseover:row', item)
    },
    onRowMouseLeave(item) {
      this.$emit('mouseleave:row', item)
    }
  }
}
</script>
