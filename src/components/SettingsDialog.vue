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
              <v-btn title="Close" flat icon @click="onCloseClick">
                <v-icon>close</v-icon>
              </v-btn>
              <v-toolbar-title>Settings</v-toolbar-title>
            </v-toolbar>
            <v-container fill-height fluid pa-0 scroll-y>
              <v-layout>
                <v-container class="my-0">
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
                    <v-subheader class="pl-0">Ignore Directories</v-subheader>
                    <template v-if="ignorePathes.length">
                      <v-list-tile v-for="path of ignorePathes" :key="path">
                        <v-list-tile-content>
                          <v-list-tile-title :title="path" v-text="path" />
                        </v-list-tile-content>
                        <v-list-tile-action>
                          <v-btn icon @click="(e) => onListTileClick(e, path)">
                            <v-icon>delete</v-icon>
                          </v-btn>
                        </v-list-tile-action>
                      </v-list-tile>
                    </template>
                    <v-list-tile v-else>
                      <v-list-tile-content>
                        <v-list-tile-title class="caption">
                          No directories
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                  <v-btn color="primary" flat @click="onAddClick">
                    Add Ignore Directory
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

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import TitleBar from '~/components/TitleBar'

export default {
  components: {
    TitleBar
  },
  computed: {
    darkTheme: {
      get() {
        return this.$store.state.settings.darkTheme
      },
      set(value) {
        this.$store.commit('settings/setDarkTheme', { darkTheme: value })
      }
    },
    refreshInterval: {
      get() {
        return this.$store.state.settings.refreshInterval
      },
      set(value) {
        if (value < 1000) {
          value = 1000
        }
        this.$store.commit('settings/setRefreshInterval', {
          refreshInterval: value
        })
      }
    },
    ...mapState(['dialog']),
    ...mapState('settings', ['ignorePathes'])
  },
  methods: {
    onCloseClick() {
      this.dismissDialog()
    },
    onAddClick() {
      this.selectIgnoreDirectory()
    },
    onListTileClick(e, path) {
      this.removeIgnorePath({ ignorePath: path })
    },
    ...mapMutations(['dismissDialog']),
    ...mapMutations('settings', ['removeIgnorePath']),
    ...mapActions('local', ['selectIgnoreDirectory'])
  }
}
</script>

<style scoped lang="scss">
.v-card {
  height: 100% !important;
}
.v-list /deep/ .v-list__tile {
  padding: 0;
}
</style>
