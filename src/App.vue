<template>
  <v-app
    :dark="darkTheme"
    @contextmenu.native="onContextMenu"
    @drop.native.prevent="onDrop"
    @dragover.native.prevent
  >
    <title-bar />
    <activity-bar />
    <v-content class="fill-height"><router-view /></v-content>
    <notification-bar />
  </v-app>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import ActivityBar from './components/ActivityBar'
import NotificationBar from './components/NotificationBar'
import TitleBar from './components/TitleBar'
import ContextMenu from './utils/context-menu'

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
      ContextMenu.show()
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

<style lang="scss">
@import '~typeface-roboto/index.css';
@import '~material-design-icons-iconfont/dist/material-design-icons.css';
@import '~vuetify/dist/vuetify.min.css';

html {
  overflow-y: hidden;
}
</style>
