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
} from '@vue/composition-api'
import ChartTableRow from '~/components/ChartTableRow.vue'
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
  colorCategory: Function
}

export default defineComponent({
  components: {
    ChartTableRow,
  },
  props: {
    selectedPaths: {
      type: Array,
      required: true,
    },
    colorCategory: {
      type: Function,
      required: true,
    },
  },
  setup(props: Props, context: SetupContext) {
    const items = computed(() => {
      return [
        { system: true, name: '<root>' },
        { system: true, name: '<parent>' },
        ...props.selectedPaths
          .reduce((carry, name) => {
            if (!carry) {
              return carry
            }
            return carry.children.find((c: any) => c.name === name)
          }, scannerStore.data)
          .children.concat()
          .sort((a: any, b: any) => {
            return a.value > b.value ? -1 : 1
          }),
      ]
    })

    const table = ref<Vue>()

    const getPaths = (item: any) => {
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

    const handleClickRow = (item: any) => {
      context.emit('click:row', item)
    }
    const handleMouseOverRow = (item: any) => {
      context.emit('mouseover:row', item)
    }
    const handleMouseLeaveRow = (item: any) => {
      context.emit('mouseleave:row', item)
    }
    const handleContextMenuRow = (item: any) => {
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
