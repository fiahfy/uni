<template>
  <v-alert :value="true" :type="type" class="chart-alert-bar ma-0">
    <v-layout row>
      <span class="spacer ellipsis">{{ text }}</span> <span>{{ subText }}</span>
    </v-layout>
  </v-alert>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import status from '~/consts/status'

export default {
  data() {
    return {
      time: 0
    }
  },
  computed: {
    type() {
      switch (this.status) {
        case status.DONE:
          return 'success'
        case status.CANCELLING:
        case status.CANCELLED:
          return 'warning'
        case status.ERROR:
          return 'error'
        case status.NOT_YET:
        case status.PROGRESS:
        default:
          return 'info'
      }
    },
    text() {
      switch (this.status) {
        case status.PROGRESS:
          return `Scanning... "${this.progressFilepath}"`
        case status.DONE:
          return `Scaned directory "${this.directory}"`
        case status.CANCELLING:
          return 'Cancelling...'
        case status.CANCELLED:
          return 'Cancelled'
        case status.ERROR:
          return `${this.error.message} "${this.directory}"`
        case status.NOT_YET:
        default:
          return 'Select directory and scan'
      }
    },
    subText() {
      switch (this.status) {
        case status.PROGRESS:
        case status.DONE:
          return `Total time: ${this.time} sec`
        default:
          return ''
      }
    },
    ...mapState('local', ['status', 'error', 'directory', 'progressFilepath']),
    ...mapGetters('local', ['getScanTime'])
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
