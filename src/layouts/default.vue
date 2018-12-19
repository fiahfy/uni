<template>
  <v-app
    :dark="darkTheme"
    @contextmenu.native="onContextMenu"
    @drop.native.prevent="onDrop"
    @dragover.native.prevent
  >
    <title-bar />
    <activity-bar />
    <v-content class="fill-height"><nuxt /></v-content>
    <notification-bar />
  </v-app>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import ActivityBar from '~/components/ActivityBar'
import NotificationBar from '~/components/NotificationBar'
import TitleBar from '~/components/TitleBar'

export default {
  components: {
    ActivityBar,
    NotificationBar,
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
    ...mapMutations('chart', ['setDirectoryInput']),
    ...mapActions('chart', ['initialize'])
  }
}
</script>

<style scoped lang="scss">
#app .v-content .container:nth-child(2) {
  /* prevent flash if page is changed */
  display: none;
}
</style>
