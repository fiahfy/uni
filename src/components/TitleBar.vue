<template>
  <v-system-bar
    v-if="titleBar"
    class="title-bar user-select-none"
    height="22"
    app
    @dblclick="onDoubleClick"
  >
    <v-spacer />
    <span class="caption text-truncate">Uni</span>
    <v-spacer />
  </v-system-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { remote } from 'electron'
import { layoutStore } from '~/store'

@Component
export default class TitleBar extends Vue {
  get titleBar() {
    return process.platform === 'darwin' && !layoutStore.fullScreen
  }

  // @see https://github.com/electron/electron/issues/16385
  onDoubleClick() {
    const doubleClickAction = remote.systemPreferences.getUserDefault(
      'AppleActionOnDoubleClick',
      'string'
    )
    const win = remote.getCurrentWindow()
    if (doubleClickAction === 'Minimize') {
      win.minimize()
    } else if (doubleClickAction === 'Maximize') {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.title-bar {
  padding: 0 72px;
  -webkit-app-region: drag;
}
</style>
