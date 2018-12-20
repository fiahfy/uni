<template>
  <v-app
    :dark="darkTheme"
    @contextmenu.native="onContextMenu"
    @drop.native.prevent="onDrop"
    @dragover.native.prevent
  >
    <title-bar />
    <v-content class="fill-height"><nuxt /></v-content>
    <notification-bar />
    <settings-dialog />
  </v-app>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import NotificationBar from '~/components/NotificationBar'
import SettingsDialog from '~/components/SettingsDialog'
import TitleBar from '~/components/TitleBar'

export default {
  components: {
    NotificationBar,
    SettingsDialog,
    TitleBar
  },
  computed: {
    ...mapState('settings', ['darkTheme'])
  },
  created() {
    this.initialize()
  },
  methods: {
    onContextMenu() {
      this.$contextMenu.show()
    },
    onDrop(e) {
      const files = Array.from(e.dataTransfer.files)
      if (!files.length) {
        return
      }
      const dirpath = files[0].path
      this.setDirectoryInput({ directoryInput: dirpath })
    },
    ...mapMutations('local', ['setDirectoryInput']),
    ...mapActions('local', ['initialize'])
  }
}
</script>

<style scoped lang="scss">
#app .v-content .container:nth-child(2) {
  /* prevent flash if page is changed */
  display: none;
}
</style>
