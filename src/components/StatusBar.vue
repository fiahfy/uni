<template>
  <v-alert
    :value="true"
    :type="type"
    class="status-bar mb-0 py-1 body-2 user-select-none"
    tile
    dense
  >
    <div class="d-flex">
      <span class="spacer text-truncate" :title="text" v-text="text" />
      <span class="text-no-wrap ml-3" v-text="subText" />
    </div>
  </v-alert>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  onMounted,
} from '@nuxtjs/composition-api'
import { scannerStore } from '~/store'

export default defineComponent({
  setup() {
    const state = reactive({
      scanTime: 0,
    })

    const type = computed(() => {
      switch (scannerStore.status) {
        case 'ready':
        case 'running':
          return 'info'
        case 'succeeded':
          return 'success'
        case 'cancelling':
        case 'cancelled':
          return 'warning'
        case 'failed':
          return 'error'
      }
    })
    const text = computed(() => {
      switch (scannerStore.status) {
        case 'running':
          return `Scanning... "${scannerStore.progressPath}"`
        case 'succeeded':
          return `Scan completed "${scannerStore.rootPath}"`
        case 'cancelling':
          return `Scan cancelling... "${scannerStore.rootPath}"`
        case 'cancelled':
          return `Scan cancelled "${scannerStore.rootPath}"`
        case 'failed':
          return `${scannerStore.message} "${scannerStore.rootPath}"`
        case 'ready':
        default:
          return 'Ready'
      }
    })
    const subText = computed(() => {
      switch (scannerStore.status) {
        case 'ready':
          return ''
        default: {
          const time = (state.scanTime / 1000).toFixed(2)
          return `Total time: ${time} sec`
        }
      }
    })

    onMounted(() => {
      window.setInterval(() => {
        state.scanTime = scannerStore.getScanTime()
      }, 0)
    })

    return {
      type,
      text,
      subText,
    }
  },
})
</script>

<style lang="scss" scoped>
.status-bar {
  ::v-deep .v-alert__content {
    min-width: 0;
  }
}
</style>
