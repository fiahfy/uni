<template>
  <tr
    class="chart-table-row"
    @click.stop="onClick"
    @contextmenu.stop="onContextMenu"
  >
    <td>
      <v-layout class="align-center">
        <span :style="{ 'background-color': color }" />
        <span class="ellipsis spacer" v-text="item.name" />
      </v-layout>
    </td>
    <td class="text-xs-right">
      {{ item.value | readableSize }} ({{ percentage }} %)
    </td>
  </tr>
</template>

<script>
import path from 'path'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  props: {
    item: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    color() {
      if (!this.colorTable) {
        return null
      }
      if (this.item.children && this.item.children.length) {
        return this.colorTable(this.item.name)
      }
      if (this.selectedPaths.length) {
        return this.colorTable(
          this.selectedPaths[this.selectedPaths.length - 1]
        )
      }
      return this.colorTable(this.node.name)
    },
    percentage() {
      return ((this.item.value / this.totalSize) * 100).toFixed(2)
    },
    ...mapState('local', ['node', 'selectedPaths', 'colorTable']),
    ...mapGetters('local', ['totalSize', 'rootPathHasNoTrailingSlash'])
  },
  methods: {
    onContextMenu() {
      const filepath = [
        this.rootPathHasNoTrailingSlash,
        ...this.selectedPaths,
        this.item.name
      ].join(path.sep)

      this.$contextMenu.show([
        {
          label: 'Open',
          click: () => {
            this.browseDirectory({ filepath })
          }
        },
        { type: 'separator' },
        {
          label: 'Copy path',
          click: () => {
            this.writeToClipboard({ filepath })
          }
        }
      ])
    },
    ...mapActions('local', ['browseDirectory', 'writeToClipboard'])
  }
}
</script>

<style scoped lang="scss">
.chart-table-row {
  cursor: pointer;
  span {
    display: inline-block;
    height: 15px;
    width: 15px;
  }
}
</style>
