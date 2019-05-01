<template>
  <tr
    class="chart-table-row"
    :class="classes"
    @click.stop="onClick"
    @contextmenu.stop="onContextMenu"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <td class="px-3 py-2 caption">
      <v-layout class="align-center">
        <template v-if="item.system">
          {{ item.name }}
        </template>
        <template v-else>
          <span class="square mr-1" :style="{ 'background-color': color }" />
          <span class="ellipsis spacer" v-text="item.name" />
        </template>
      </v-layout>
    </td>
    <td class="px-3 py-2 caption text-xs-right text-no-wrap">
      <template v-if="!item.system">
        {{ item.value | readableSize }} ({{ percentage }} %)
      </template>
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
    classes() {
      return {
        clickable:
          this.item.system || (this.item.children && this.item.children.length)
      }
    },
    color() {
      if (!this.colorTable) {
        return null
      }
      if (this.item.children && this.item.children.length) {
        return this.colorTable(this.item.name)
      }
      if (this.selectedNames.length) {
        return this.colorTable(
          this.selectedNames[this.selectedNames.length - 1]
        )
      }
      return this.colorTable(this.node.name)
    },
    percentage() {
      return ((this.item.value / this.totalSize) * 100).toFixed(2)
    },
    ...mapState('local', ['selectedNames', 'node', 'colorTable']),
    ...mapGetters('local', ['totalSize', 'rootPathHasNoTrailingSlash'])
  },
  methods: {
    onClick() {
      this.$emit('click', this.item)
    },
    onMouseOver() {
      this.$emit('mouseover', this.item)
    },
    onMouseLeave() {
      this.$emit('mouseleave', this.item)
    },
    onContextMenu() {
      let paths = []
      if (this.item.system) {
        if (this.item.name === '<parent>') {
          paths = [this.rootPathHasNoTrailingSlash, ...this.selectedNames]
        } else {
          paths = [this.rootPathHasNoTrailingSlash]
        }
      } else {
        paths = [
          this.rootPathHasNoTrailingSlash,
          ...this.selectedNames,
          this.item.name
        ]
      }
      const filepath = paths.join(path.sep)

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
  &.clickable {
    cursor: pointer;
  }
  td {
    height: unset;
  }
  .square {
    display: inline-block;
    height: 12px;
    width: 12px;
  }
}
</style>
