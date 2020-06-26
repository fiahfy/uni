<template>
  <v-dialog
    v-model="state.active"
    class="settings-dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    eager
  >
    <v-card flat tile>
      <div class="d-flex flex-column fill-height">
        <title-bar :app="false" />
        <v-main class="fill-height px-0">
          <div class="d-flex flex-column fill-height">
            <v-toolbar flat dense>
              <v-btn title="Close" icon @click="handleClickClose">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-toolbar-title>Settings</v-toolbar-title>
            </v-toolbar>
            <v-container fill-height align-start overflow-y-auto>
              <div class="d-flex flex-column flex-grow-1">
                <v-subheader class="pl-0 text-uppercase">General</v-subheader>
                <v-checkbox
                  v-model="darkTheme"
                  class="mt-0"
                  label="Dark Theme"
                />

                <v-subheader class="pl-0 text-uppercase">Scan</v-subheader>
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
                  <v-subheader class="pl-0">Ignored Folders</v-subheader>
                  <template v-if="ignoredPaths.length">
                    <v-list-item v-for="path of ignoredPaths" :key="path">
                      <v-list-item-content>
                        <v-list-item-title :title="path" v-text="path" />
                      </v-list-item-content>
                      <v-list-item-action class="my-0">
                        <v-btn icon @click="() => handleClickListItem(path)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </template>
                  <v-list-item v-else>
                    <v-list-item-content>
                      <v-list-item-title class="caption">
                        No folders
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-btn color="primary" depressed @click="handleClickAdd">
                  Add Folder
                </v-btn>
              </div>
            </v-container>
          </div>
        </v-main>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { remote } from 'electron'
import {
  defineComponent,
  computed,
  reactive,
  onMounted,
  onUnmounted,
  SetupContext,
} from '@vue/composition-api'
import TitleBar from '~/components/TitleBar.vue'
import { settingsStore } from '~/store'

export default defineComponent({
  components: {
    TitleBar,
  },
  setup(_props: {}, context: SetupContext) {
    const state = reactive({
      active: false,
    })

    const darkTheme = computed({
      get: () => {
        return settingsStore.darkTheme
      },
      set: (value) => {
        settingsStore.setDarkTheme({ darkTheme: value })
      },
    })
    const refreshInterval = computed({
      get: () => {
        return settingsStore.refreshInterval
      },

      set: (value) => {
        if (value < 1000) {
          value = 1000
        }
        settingsStore.setRefreshInterval({
          refreshInterval: value,
        })
      },
    })
    const ignoredPaths = computed(() => {
      return settingsStore.ignoredPaths
    })

    const show = () => {
      state.active = true
    }

    const handleClickClose = () => {
      state.active = false
    }
    const handleClickAdd = async () => {
      const { filePaths } = await remote.dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections'],
      })
      if (!filePaths.length) {
        return
      }
      settingsStore.addIgnoredPaths({ ignoredPaths: filePaths })
    }
    const handleClickListItem = (path: string) => {
      settingsStore.removeIgnoredPath({ ignoredPath: path })
    }

    onMounted(() => {
      context.root.$eventBus.$on('show-settings', show)
    })

    onUnmounted(() => {
      context.root.$eventBus.$off('show-settings', show)
    })

    return {
      state,
      darkTheme,
      refreshInterval,
      ignoredPaths,
      handleClickClose,
      handleClickAdd,
      handleClickListItem,
    }
  },
})
</script>

<style lang="scss" scoped>
.v-card {
  height: 100% !important;
}
</style>
