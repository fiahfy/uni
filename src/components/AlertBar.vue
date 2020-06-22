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
import {
  defineComponent,
  reactive,
  computed,
  onMounted,
} from '@vue/composition-api'
import { scannerStore } from '~/store'

export default defineComponent({
  setup(_props: {}) {
    const state = reactive({
      scanTime: 0,
    })

    const type = computed(() => {
      switch (scannerStore.status) {
        case 'succeeded':
          return 'success'
        case 'cancelling':
        case 'cancelled':
          return 'warning'
        case 'failed':
          return 'error'
        case 'ready':
        case 'running':
        default:
          return 'info'
      }
    })
    const text = computed(() => {
      switch (scannerStore.status) {
        case 'running':
          return `Scanning... "${scannerStore.progressFilePath}"`
        case 'succeeded':
          return `Scan finished "${scannerStore.rootPath}"`
        case 'cancelling':
          return 'Cancelling...'
        case 'cancelled':
          return 'Cancelled'
        case 'failed':
          return `${scannerStore.error?.message} "${scannerStore.rootPath}"`
        case 'ready':
        default:
          return 'Click "SCAN" to get started'
      }
    })
    const subText = computed(() => {
      switch (scannerStore.status) {
        case 'running':
        case 'succeeded': {
          const time = (state.scanTime / 1000).toFixed(2)
          return `Total time: ${time} sec`
        }
        default:
          return ''
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
.alert-bar {
  ::v-deep .v-alert__content {
    min-width: 0;
  }
}
</style>
