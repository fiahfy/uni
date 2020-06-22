<template>
  <v-card class="toolbar" flat tile>
    <v-toolbar flat dense extension-height="1" color="transparent">
      <v-btn
        class="px-5"
        color="primary"
        :title="'Scan' | accelerator('CmdOrCtrl+O')"
        :disabled="cancelling"
        :depressed="!scanning"
        :outlined="scanning"
        rounded
        @click="handleClickScan"
      >
        <v-icon left>mdi-file-find</v-icon>
        {{ title }}
      </v-btn>

      <v-spacer />

      <v-btn
        :title="'Settings' | accelerator('CmdOrCtrl+,')"
        icon
        @click="handleClickSettings"
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>
      <v-divider slot="extension" />
    </v-toolbar>
  </v-card>
</template>

<script lang="ts">
import { remote } from 'electron'
import { defineComponent, computed, SetupContext } from '@vue/composition-api'
import { scannerStore } from '~/store'

export default defineComponent({
  setup(_props: {}, context: SetupContext) {
    const scanning = computed(() => {
      return ['running', 'cancelling'].includes(scannerStore.status)
    })

    const cancelling = computed(() => {
      return scannerStore.status === 'cancelling'
    })

    const title = computed(() => {
      switch (scannerStore.status) {
        case 'running':
          return 'Cancel'
        case 'cancelling':
          return 'Cancelling'
        default:
          return 'Scan'
      }
    })

    const handleClickScan = async () => {
      if (scanning.value) {
        return scannerStore.cancel()
      }
      const { filePaths } = await remote.dialog.showOpenDialog({
        properties: ['openDirectory'],
      })
      const dirPath = filePaths[0]
      if (dirPath) {
        scannerStore.start({ dirPath })
      }
    }

    const handleClickSettings = () => {
      context.root.$eventBus.$emit('show-settings')
    }

    return {
      scanning,
      cancelling,
      title,
      handleClickScan,
      handleClickSettings,
    }
  },
})
</script>

<style lang="scss" scoped>
.toolbar ::v-deep {
  .v-toolbar__extension {
    padding: 0;
  }
}
</style>
