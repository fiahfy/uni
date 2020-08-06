<template>
  <tr class="chart-table-row" :class="classes">
    <td :title="item.name">
      <v-layout class="align-center">
        <span v-if="item.system" class="primary--text" v-text="item.name" />
        <template v-else>
          <span class="color mr-1" :style="{ 'background-color': color }" />
          <span class="text-truncate" :title="item.name" v-text="item.name" />
        </template>
      </v-layout>
    </td>
    <td class="text-xs-right text-no-wrap">
      <template v-if="!item.system">
        {{ item.value | prettyBytes }} ({{ percentage }} %)
      </template>
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'
import { scannerStore } from '../store'

type Item = {
  name: string
  value: number
  children: Item[]
  system: boolean
}

type Props = {
  item: Item
  selectedPaths: string[]
  colorCategory: d3.ScaleOrdinal<string, string>
}

export default defineComponent({
  props: {
    item: {
      type: Object,
      required: true,
    },
    selectedPaths: {
      type: Array,
      required: true,
    },
    colorCategory: {
      type: Function,
    },
  },
  setup(props: Props) {
    const clickable = computed(() => {
      return (
        props.item.system || (props.item.children && props.item.children.length)
      )
    })
    const classes = computed(() => {
      return {
        clickable,
      }
    })
    const color = computed(() => {
      if (!props.colorCategory) {
        return undefined
      }
      // directory
      if (props.item.children && props.item.children.length) {
        return props.colorCategory(props.item.name)
      }
      // file
      if (props.selectedPaths.length) {
        return props.colorCategory(
          props.selectedPaths[props.selectedPaths.length - 1]
        )
      }
      // file for root
      return props.colorCategory(scannerStore.data?.name ?? '')
    })
    const percentage = computed(() => {
      return ((props.item.value / scannerStore.totalSize) * 100).toFixed(2)
    })

    return {
      classes,
      color,
      percentage,
    }
  },
})
</script>

<style lang="scss" scoped>
.chart-table-row {
  &.clickable {
    cursor: pointer;
  }
  .color {
    display: inline-block;
    height: 12px;
    width: 12px;
    min-width: 12px;
  }
}
</style>
