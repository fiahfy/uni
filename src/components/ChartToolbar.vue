<template>
  <v-toolbar class="chart-toolbar" flat dense>
    <v-btn
      class="px-5"
      color="primary"
      :title="'Scan' | accelerator('CmdOrCtrl+O')"
      :disabled="cancelling"
      :depressed="!scanning"
      :outlined="scanning"
      rounded
      @click="onClickScan"
    >
      <v-icon left>mdi-file-find</v-icon>
      {{ title }}
    </v-btn>

    <v-spacer />

    <v-btn
      :title="'Settings' | accelerator('CmdOrCtrl+,')"
      text
      icon
      @click="onClickSettings"
    >
      <v-icon>mdi-settings</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
import { remote } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { layoutStore, scannerStore } from '~/store'

@Component
export default class ChartToolbar extends Vue {
  get scanning() {
    return ['PROGRESS', 'CANCELLING'].includes(scannerStore.status)
  }

  get cancelling() {
    return scannerStore.status === 'CANCELLING'
  }

  get title() {
    switch (scannerStore.status) {
      case 'PROGRESS':
        return 'Cancel'
      case 'CANCELLING':
        return 'Cancelling'
      default:
        return 'Scan'
    }
  }

  async onClickScan() {
    if (this.scanning) {
      return scannerStore.cancel()
    }
    const { filePaths } = await remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    const dirPath = filePaths[0]
    if (dirPath) {
      scannerStore.start({ dirPath })
    }
  }

  onClickSettings() {
    layoutStore.setDialog({ dialog: true })
  }
}
</script>
