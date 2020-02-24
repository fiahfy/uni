<template>
  <v-dialog
    v-model="dialog"
    class="settings-dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card flat tile>
      <v-layout column fill-height>
        <title-bar />
        <v-content class="fill-height">
          <v-layout column fill-height>
            <v-toolbar flat dense>
              <v-btn title="Close" text icon @click="onClickClose">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-toolbar-title>Settings</v-toolbar-title>
            </v-toolbar>
            <v-container fill-height fluid pa-0 overflow-y-scroll>
              <v-layout>
                <v-container>
                  <v-subheader class="pl-0">GENERAL</v-subheader>
                  <v-checkbox
                    v-model="darkTheme"
                    class="mt-0"
                    label="Dark Theme"
                  />

                  <v-subheader class="pl-0">SCAN</v-subheader>
                  <v-text-field
                    v-model="refreshInterval"
                    type="number"
                    required
                    label="Refresh Interval"
                    min="1000"
                    step="1000"
                    suffix="ms"
                  />

                  <v-list subheader dense>
                    <v-subheader class="pl-0">Ignored Directories</v-subheader>
                    <template v-if="ignoredPaths.length">
                      <v-list-item v-for="path of ignoredPaths" :key="path">
                        <v-list-item-content>
                          <v-list-item-title :title="path" v-text="path" />
                        </v-list-item-content>
                        <v-list-item-action class="my-0">
                          <v-btn icon @click="() => onClickListItem(path)">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </template>
                    <v-list-item v-else>
                      <v-list-item-content>
                        <v-list-item-title class="caption">
                          No directories
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                  <v-btn color="primary" depressed @click="onClickAdd">
                    Ignore Directory
                  </v-btn>
                </v-container>
              </v-layout>
            </v-container>
          </v-layout>
        </v-content>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { remote } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { layoutStore, settingsStore } from '~/store'
import TitleBar from '~/components/TitleBar.vue'

@Component({
  components: {
    TitleBar
  }
})
export default class SettingsDialog extends Vue {
  get dialog() {
    return layoutStore.dialog
  }

  set dialog(value) {
    layoutStore.setDialog({ dialog: value })
  }

  get darkTheme() {
    return settingsStore.darkTheme
  }

  set darkTheme(value) {
    settingsStore.setDarkTheme({ darkTheme: value })
  }

  get refreshInterval() {
    return settingsStore.refreshInterval
  }

  set refreshInterval(value) {
    if (value < 1000) {
      value = 1000
    }
    settingsStore.setRefreshInterval({
      refreshInterval: value
    })
  }

  get ignoredPaths() {
    return settingsStore.ignoredPaths
  }

  onClickClose() {
    this.dialog = false
  }

  async onClickAdd() {
    const { filePaths } = await remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!filePaths.length) {
      return
    }
    const ignoredPath = filePaths[0]
    settingsStore.addIgnoredPath({ ignoredPath })
  }

  onClickListItem(path: string) {
    settingsStore.removeIgnoredPath({ ignoredPath: path })
  }
}
</script>

<style lang="scss" scoped>
.v-card {
  height: 100% !important;
}
.v-list ::v-deep .v-list__tile {
  padding: 0;
}
</style>
