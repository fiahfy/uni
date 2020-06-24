<template>
  <v-card class="toolbar" flat tile>
    <v-toolbar flat dense color="transparent">
      <v-text-field
        v-model="location"
        dense
        filled
        rounded
        single-line
        hide-details
        class="mr-3"
        placeholder="Select Folder..."
        prepend-inner-icon="mdi-folder"
        @click:prepend-inner="handleClickFolder"
        @contextmenu.stop="handleContextMenu"
      />
      <v-btn
        class="px-5"
        color="primary"
        :title="'Scan' | accelerator('CmdOrCtrl+O')"
        :disabled="disabled"
        :depressed="depressed"
        :outlined="outlined"
        rounded
        @click="handleClickScan"
      >
        <v-icon left>mdi-file-find</v-icon>
        {{ title }}
      </v-btn>
      <v-btn
        :title="'Settings' | accelerator('CmdOrCtrl+,')"
        icon
        @click="handleClickSettings"
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-toolbar>
  </v-card>
</template>

<script lang="ts">
import { remote } from 'electron'
import {
  defineComponent,
  computed,
  onMounted,
  onUnmounted,
  SetupContext,
} from '@vue/composition-api'
import { scannerStore } from '~/store'

export default defineComponent({
  setup(_props: {}, context: SetupContext) {
    const location = computed({
      get: () => {
        return scannerStore.location
      },
      set: (value) => {
        scannerStore.setLocation({ location: value })
      },
    })
    const disabled = computed(() => {
      switch (scannerStore.status) {
        case 'running':
          return false
        case 'cancelling':
          return true
        default:
          return !location.value
      }
    })
    const scanning = computed(() => {
      return ['running', 'cancelling'].includes(scannerStore.status)
    })
    const depressed = computed(() => {
      return !scanning.value
    })
    const outlined = computed(() => {
      return scanning.value
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

    const changeLocation = (loc: string) => {
      location.value = loc
    }

    const handleClickFolder = async () => {
      const { filePaths } = await remote.dialog.showOpenDialog({
        properties: ['openDirectory'],
      })
      location.value = filePaths[0] ?? ''
    }
    const handleClickScan = () => {
      scanning.value ? scannerStore.cancel() : scannerStore.run()
    }
    const handleClickSettings = () => {
      context.root.$eventBus.$emit('show-settings')
    }

    onMounted(() => {
      context.root.$eventBus.$on('change-location', changeLocation)
    })

    onUnmounted(() => {
      context.root.$eventBus.$off('change-location', changeLocation)
    })

    return {
      location,
      disabled,
      depressed,
      outlined,
      title,
      handleClickFolder,
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
