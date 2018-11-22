<template>
  <v-alert :value="true" :type="type" class="chart-alert-bar ma-0">
    <v-layout row>
      <span class="spacer ellipsis">{{ text }}</span> <span>{{ subText }}</span>
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
    type() {
      switch (this.status) {
        case Status.notYet:
        case Status.progress:
          return 'info'
        case Status.done:
          return 'success'
        case Status.cancelling:
        case Status.cancelled:
          return 'warning'
        case Status.error:
          return 'error'
      }
    },
    text() {
      switch (this.status) {
        case Status.notYet:
          return 'Select directory and scan'
        case Status.progress:
          return `Scanning... "${this.progressFilepath}"`
        case Status.done:
          return `Scaned directory "${this.directory}"`
        case Status.cancelling:
          return 'Cancelling...'
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
    ...mapState('chart', ['status', 'error', 'directory', 'progressFilepath']),
    ...mapGetters('chart', ['getScanTime'])
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
