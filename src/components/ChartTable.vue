<template>
  <v-data-table
    ref="table"
    :headers="headers"
    :items="items"
    class="chart-table"
    disable-pagination
    disable-sort
    hide-default-footer
    dense
  >
    <template v-slot:item="props">
      <chart-table-row
        :item="props.item"
        :selected-paths="selectedPaths"
        :color-category="colorCategory"
        @click.native="() => handleClickRow(props.item)"
        @mouseover.native="() => handleMouseOverRow(props.item)"
        @mouseleave.native="() => handleMouseLeaveRow(props.item)"
        @contextmenu.native.stop="() => handleContextMenuRow(props.item)"
      />
    </template>
  </v-data-table>
</template>

<script lang="ts">
import path from 'path'
import { remote, clipboard } from 'electron'
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  SetupContext,
} from 'nuxt-composition-api'
import { Node } from '~/models'
import { scannerStore } from '~/store'

const headers = [
  {
    text: 'Name',
    value: 'name',
  },
  {
    text: 'Size',
    value: 'value',
    width: 150,
  },
]

type Props = {
  selectedPaths: string[]
  colorCategory: d3.ScaleOrdinal<string, string>
}

export default defineComponent({
  props: {
    selectedPaths: {
      type: Array,
      required: true,
    },
    colorCategory: {
      type: Function,
    },
  },
  setup(props: Props, context: SetupContext) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const items = computed(() => {
      let nodes = []
      if (scannerStore.data) {
        nodes = props.selectedPaths
          .reduce((carry, name) => {
            if (!carry) {
              return carry
            }
            return carry.children.find((c: Node) => c.name === name)
          }, scannerStore.data as any)
          .children.concat()
          .sort((a: any, b: any) => {
            return a.value > b.value ? -1 : 1
          })
      }
      return [
        { system: true, name: '<root>' },
        { system: true, name: '<parent>' },
        ...nodes,
      ]
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const table = ref<Vue>()

    const getPaths = (item: Node) => {
      let paths = [scannerStore.rootPathHasNoTrailingSlash]
      if (item.system) {
        if (item.name === '<parent>') {
          paths = [...paths, ...props.selectedPaths]
        }
      } else {
        paths = [...paths, ...props.selectedPaths, item.name]
      }
      return paths
    }

    const handleClickRow = (item: Node) => {
      context.emit('click:row', item)
    }
    const handleMouseOverRow = (item: Node) => {
      context.emit('mouseover:row', item)
    }
    const handleMouseLeaveRow = (item: Node) => {
      context.emit('mouseleave:row', item)
    }
    const handleContextMenuRow = (item: Node) => {
      const filePath = getPaths(item).join(path.sep)

      context.root.$contextMenu.open([
        {
          label: 'Open',
          click: () => remote.shell.openItem(filePath),
        },
        { type: 'separator' },
        {
          label: 'Copy path',
          click: () => clipboard.writeText(filePath),
        },
      ])
    }

    onMounted(() => {
      const container = (table.value?.$el.querySelector(
        '.v-data-table__wrapper'
      ) ?? null) as HTMLDivElement | null
      if (container) {
        container.classList.add('scrollbar')
        // Must set overflow after scrollbar class is added
        container.style.overflowY = 'scroll'
      }
    })

    return {
      headers,
      items,
      table,
      handleClickRow,
      handleMouseOverRow,
      handleMouseLeaveRow,
      handleContextMenuRow,
    }
  },
})
</script>

<style lang="scss" scoped>
.chart-table {
  ::v-deep .v-data-table__wrapper {
    height: 100%;
    background: inherit;
    position: relative;
    table {
      table-layout: fixed;
      background: inherit;
      > thead {
        background: inherit;
        &.v-data-table-header-mobile {
          display: none;
        }
        > tr {
          background: inherit;
          > th {
            background: inherit;
            position: sticky;
            top: 0;
            z-index: 1;
          }
        }
      }
    }
  }
}
</style>
