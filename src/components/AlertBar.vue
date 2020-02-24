<template>
  <v-alert
    :value="true"
    :type="type"
    class="alert-bar mb-0 body-2"
    tile
    text
    dense
  >
    <div class="d-flex">
      <span class="spacer text-truncate" :title="text" v-text="text" />
      <span v-text="subText" />
    </div>
  </v-alert>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { scannerStore } from '~/store'

@Component
export default class AlertBar extends Vue {
  scanTime = 0

  get type() {
    switch (scannerStore.status) {
      case 'DONE':
        return 'success'
      case 'CANCELLING':
      case 'CANCELLED':
        return 'warning'
      case 'ERROR':
        return 'error'
      case 'NOT_YET':
      case 'PROGRESS':
      default:
        return 'info'
    }
  }

  get text() {
    switch (scannerStore.status) {
      case 'PROGRESS':
        return `Scanning... "${scannerStore.progressFilePath}"`
      case 'DONE':
        return `Scan finished "${scannerStore.rootPath}"`
      case 'CANCELLING':
        return 'Cancelling...'
      case 'CANCELLED':
        return 'Cancelled'
      case 'ERROR':
        return `${scannerStore.error?.message} "${scannerStore.rootPath}"`
      case 'NOT_YET':
      default:
        return 'Click "SCAN" to get started'
    }
  }

  get subText() {
    switch (scannerStore.status) {
      case 'PROGRESS':
      case 'DONE': {
        const time = (this.scanTime / 1000).toFixed(2)
        return `Total time: ${time} sec`
      }
      default:
        return ''
    }
  }

  mounted() {
    window.setInterval(() => {
      this.scanTime = scannerStore.getScanTime()
    }, 0)
  }
}
</script>

<style lang="scss" scoped>
.alert-bar {
  ::v-deep .v-alert__content {
    min-width: 0;
  }
}
</style>
