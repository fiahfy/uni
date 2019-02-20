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
                    <v-subheader>Ignore path</v-subheader>
                    <v-list-tile>
                      <v-list-tile-content>
                        <v-list-tile-title>test</v-list-tile-title>
                      </v-list-tile-content>

                      <v-list-tile-action>
                        <v-icon>chat_bubble</v-icon>
                      </v-list-tile-action>
                    </v-list-tile>
                  </v-list>
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
import { mapState, mapMutations } from 'vuex'
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
    ...mapState(['dialog'])
  },
  methods: {
    onCloseClick() {
      this.dismissDialog()
    },
    ...mapMutations(['dismissDialog'])
  }
}
</script>

<style scoped lang="scss">
.v-card {
  height: 100% !important;
}
</style>
