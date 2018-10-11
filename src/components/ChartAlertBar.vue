<template>
  <v-alert
    v-if="type"
    :value="alert"
    :type="type"
    class="chart-alert-bar ma-0"
  >
    <v-layout row>
      <span class="spacer ellipsis">{{ text }}</span>
      <span>{{ subText }}</span>
    </v-layout>
  </v-alert>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { Status } from '~/store/chart'

export default {
  data() {
    return {
      time: 0
    }
  },
  computed: {
    alert() {
      return true
    },
    type() {
      switch (this.status) {
        case Status.notYet:
        case Status.progress:
          return 'info'
        case Status.done:
          return 'success'
        case Status.cancelled:
          return 'warning'
        case Status.error:
          return 'error'
      }
      return ''
    },
    text() {
      switch (this.status) {
        case Status.notYet:
          return 'Select scan directory and click scan'
        case Status.progress:
          return `Scanning... "${this.progressFilepath}"`
        case Status.done:
          return `Scaned directory "${this.directory}"`
        case Status.cancelled:
          return 'Cancelled'
        case Status.error:
          return `${this.error.message} "${this.directory}"`
      }
    },
    subText() {
      switch (this.status) {
        case Status.progress:
        case Status.done:
          return `Total time: ${this.time} sec`
        default:
          return ''
      }
    },
    ...mapState({
      status: (state) => state.chart.status,
      error: (state) => state.chart.error,
      directory: (state) => state.chart.directory,
      progressFilepath: (state) => state.chart.progressFilepath
    }),
    ...mapGetters({
      getScanTime: 'chart/getScanTime'
    })
  },
  mounted() {
    window.setInterval(() => {
      this.time = (this.getScanTime() / 1000).toFixed(2)
    }, 0)
  }
}
</script>

<style scoped lang="scss">
.v-alert /deep/ div {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
