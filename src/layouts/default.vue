<template>
  <v-app
    :dark="darkTheme"
    @contextmenu.native="onContextMenu"
    @drop.native.prevent="onDrop"
    @dragover.native.prevent
  >
    <title-bar />
    <v-content class="fill-height">
      <router-view class="fill-height" />
    </v-content>
    <notification-bar />
    <settings-dialog />
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { settingsStore } from '~/store'
import NotificationBar from '~/components/NotificationBar.vue'
import SettingsDialog from '~/components/SettingsDialog.vue'
import TitleBar from '~/components/TitleBar.vue'

@Component({
  components: {
    NotificationBar,
    SettingsDialog,
    TitleBar
  }
})
export default class Layout extends Vue {
  get darkTheme() {
    return settingsStore.darkTheme
  }

  created() {
    // this.initialize()
    this.$vuetify.theme.dark = this.darkTheme
  }

  @Watch('darkTheme')
  onDarkThemeChanged(value: boolean) {
    this.$vuetify.theme.dark = value
  }

  onContextMenu() {
    this.$contextMenu.open()
  }

  // onDrop(e) {
  //   const files = Array.from(e.dataTransfer.files)
  //   if (!files.length) {
  //     return
  //   }
  //   const dirPath = files[0].path
  //   this.scan({ dirPath })
  // }
}
</script>

<style lang="scss">
@import '~/assets/app.scss';
</style>
