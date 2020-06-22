<template>
  <div ref="graph" class="chart-graph pa-3">
    <div ref="wrapper" class="wrapper fill-height hide-overflow">
      <svg ref="sunburst" />
    </div>

    <div v-if="state.loading" class="overlay" />

    <v-tooltip
      v-model="state.tooltip.show"
      :position-x="state.tooltip.x"
      :position-y="state.tooltip.y"
      top
    >
      <p class="ma-0">
        {{ state.tooltip.text }}<br />
        <small>{{ state.targetSize | prettyBytes }} ({{ percentage }} %)</small>
      </p>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import path from 'path'
import * as d3 from 'd3'
import { debounce } from 'debounce'
import {
  defineComponent,
  computed,
  ref,
  reactive,
  watch,
  onMounted,
  onUnmounted,
} from '@vue/composition-api'
import { scannerStore } from '~/store'

export default defineComponent({
  setup(_props: {}) {
    const state = reactive<{
      loading: boolean
      needsUpdate: boolean
      targetSize: number
      tooltip: {
        show: boolean
        x: number
        y: number
        text: string
      }
      depth: number
      resizeObserver?: ResizeObserver
      debounced?: ReturnType<typeof debounce>
      svg?: d3.Selection<SVGGElement, unknown, null, undefined>
      transition?: d3.Transition<any, unknown, null, undefined>
      width: number
      height: number
      radius: number
      color?: d3.ScaleOrdinal<string, string>
      x?: d3.ScaleLinear<number, number>
      y?: d3.ScalePower<number, number>
      arc?: d3.Arc<any, d3.DefaultArcObject>
      partition?: d3.PartitionLayout<any>
      root?: d3.HierarchyNode<any>
    }>({
      loading: false,
      needsUpdate: false,
      targetSize: 0,
      tooltip: {
        show: false,
        x: 0,
        y: 0,
        text: '',
      },
      depth: 0,
      resizeObserver: undefined,
      debounced: undefined,
      svg: undefined,
      transition: undefined,
      width: 0,
      height: 0,
      radius: 0,
      color: undefined,
      x: undefined,
      y: undefined,
      arc: undefined,
      partition: undefined,
      root: undefined,
    })

    const percentage = computed(() => {
      return ((state.targetSize / scannerStore.totalSize) * 100).toFixed(2)
    })
    const node = computed(() => {
      return scannerStore.data
    })

    const graph = ref<HTMLDivElement>()
    const wrapper = ref<HTMLDivElement>()
    const sunburst = ref<any>()

    const setup = () => {
      const g = graph.value?.querySelector('svg g')
      g && g.remove()

      sunburst.value!.setAttribute('width', 0)
      sunburst.value!.setAttribute('height', 0)

      state.width = wrapper.value!.offsetWidth
      state.height = wrapper.value!.offsetHeight
      state.radius = Math.min(state.width, state.height) / 2
      state.color = d3.scaleOrdinal(d3.schemePaired)
      scannerStore.setColorTable({ colorTable: state.color })

      state.x = d3.scaleLinear().range([0, 2 * Math.PI])
      state.y = d3.scaleSqrt().range([0, state.radius])
      state.arc = d3
        .arc()
        .startAngle((d: any) =>
          Math.max(0, Math.min(2 * Math.PI, state.x!(d.x0)))
        )
        .endAngle((d: any) =>
          Math.max(0, Math.min(2 * Math.PI, state.x!(d.x1)))
        )
        .innerRadius((d: any) => Math.max(0, state.y!(d.y0)))
        .outerRadius((d: any) => Math.max(0, state.y!(d.y1)))

      state.svg = d3
        .select(graph.value!.querySelector('svg'))
        .attr('width', state.width)
        .attr('height', state.height)
        .append('g')
        .attr('transform', `translate(${state.width / 2},${state.height / 2})`)

      state.partition = d3.partition()

      state.transition = d3.transition().duration(300)

      update()
    }
    const update = () => {
      state.targetSize = 0
      scannerStore.setHoveredNames({ hoveredNames: [] })
      scannerStore.setSelectedNames({ selectedNames: [] })

      state.loading = true

      if (!node.value) {
        Array.from(graph.value!.querySelectorAll('svg path')).forEach((el) =>
          el.remove()
        )
        state.loading = false
        return
      }
      console.log(node.value)
      const root = d3.hierarchy(node.value)

      state.root = root
      state.depth = 0
      state.targetSize = root.value ?? 0

      const path = state
        .svg!.selectAll('path')
        .data(state.partition!(root).descendants(), (d: any) => d)

      path
        .exit()
        .style('opacity', 1)
        .transition(state.transition!)
        .style('opacity', 0)
        .remove()

      path
        .enter()
        .append('path')
        // .merge(path)
        .attr('d', state.arc as any)
        .style('fill', (d: any) =>
          d.depth === 0
            ? 'transparent'
            : state.color!((d.children ? d : d.parent).data.name)
        )
        .style('fill-rule', 'evenodd')
        .style('cursor', (d: any) => (d.children ? 'pointer' : 'auto'))
        .style('opacity', 0)
        .on('mouseover', handleMouseOver)
        .on('mouseleave', handleMouseLeave)
        .on('contextmenu', handleContextMenu)
        .on('click', handleClick)
        .transition(state.transition!)
        .style('opacity', 1)

      handleClick(root)

      state.loading = false
      state.needsUpdate = false
    }
    const moveTo = (item: any) => {
      const node = scannerStore
        .getPaths(item)
        .slice(1)
        .reduce((carry: any, name: any) => {
          if (!carry) {
            return carry
          }
          return carry.children.find((c: any) => c.data.name === name)
        }, state.root)

      handleClick(node)
    }
    const hover = (item: any) => {
      const node = scannerStore
        .getPaths(item)
        .slice(1)
        .reduce((carry: any, name: any) => {
          if (!carry) {
            return carry
          }
          return carry.children.find((c: any) => c.data.name === name)
        }, state.root)

      handleMouseOver(node)
    }
    const unhover = () => {
      handleMouseLeave()
    }
    const changeDepth = (index: number) => {
      const node = [...scannerStore.selectedNames, ...scannerStore.hoveredNames]
        .slice(0, index)
        .reduce((carry: any, name: any) => {
          if (!carry) {
            return carry
          }
          return carry.children.find((c: any) => c.data.name === name)
        }, state.root)

      if (state.depth === node.depth) {
        return
      }

      handleClick(node)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && state.needsUpdate) {
        update()
      }
    }
    const handleResize = () => {
      state.debounced!()
    }
    const handleMouseOver = (d: any) => {
      if (d.depth === 0) {
        return
      }
      const ancestors = d.ancestors().reverse()

      const hoveredNames = ancestors
        .slice(scannerStore.selectedNames.length + 1)
        .map((d: any) => d.data.name)
      scannerStore.setHoveredNames({ hoveredNames })

      state.targetSize = d.value

      state
        .svg!.selectAll('path')
        .style('opacity', 0.3)
        .filter((d) => ancestors.includes(d))
        .style('opacity', 1)

      if (!d3.event) {
        return
      }

      state.tooltip.show = true
      state.tooltip.x = d3.event.clientX
      state.tooltip.y = d3.event.clientY
      state.tooltip.text = d.data.name
    }
    const handleMouseLeave = () => {
      scannerStore.setHoveredNames({ hoveredNames: [] })
      state.targetSize = scannerStore.totalSize

      state.svg!.selectAll('path').style('opacity', 1)

      state.tooltip.show = false
    }
    const handleContextMenu = (d: any) => {
      if (d.depth === 0) {
        return
      }
      const ancestors = d.ancestors().reverse()
      const filePath = [
        scannerStore.rootPathHasNoTrailingSlash,
        ...scannerStore.selectedNames,
        ...ancestors
          .slice(scannerStore.selectedNames.length + 1)
          .map((d: any) => d.data.name),
      ].join(path.sep)

      // this.$contextMenu.show([
      //   {
      //     label: 'Open',
      //     click: () => {
      //       this.browseDirectory({ filePath })
      //     }
      //   },
      //   { type: 'separator' },
      //   {
      //     label: 'Copy path',
      //     click: () => {
      //       this.writeToClipboard({ filePath })
      //     }
      //   }
      // ])
    }
    const handleClick = (d: any) => {
      if (!d.children) {
        return
      }
      if (state.depth === d.depth && d.parent) {
        d = d.parent
      }
      const ancestors = d.ancestors().reverse()

      state.depth = d.depth
      const selectedNames = ancestors.slice(1).map((d: any) => d.data.name)
      scannerStore.setSelectedNames({ selectedNames })
      scannerStore.setHoveredNames({ hoveredNames: [] })

      state
        .svg!.transition(state.transition!)
        .tween('scale', () => {
          const xd = d3.interpolate(state.x!.domain(), [d.x0, d.x1])
          const yd = d3.interpolate(state.y!.domain(), [d.y0, 1])
          const yr = d3.interpolate(state.y!.range(), [0, state.radius])
          return (t: any) => {
            state.x!.domain(xd(t))
            state.y!.domain(yd(t)).range(yr(t))
          }
        })
        .selectAll('path')
        .attrTween('d', (d: any) => () => state.arc!(d) as any)
    }

    watch(
      () => node.value,
      () => {
        if (document.hidden) {
          state.needsUpdate = true
        } else {
          update()
        }
      }
    )

    onMounted(() => {
      window.addEventListener('visibilitychange', handleVisibilityChange)
      state.resizeObserver = new ResizeObserver(handleResize)
      wrapper.value && state.resizeObserver.observe(wrapper.value)
      state.debounced = debounce(() => {
        setup()
      }, 500)
      state.debounced()
    })

    onUnmounted(() => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      state.resizeObserver!.disconnect()
    })

    return {
      state,
      percentage,
      graph,
      wrapper,
      sunburst,
      moveTo,
      hover,
      unhover,
      changeDepth,
    }
  },
})
</script>

<style lang="scss">
svg path {
  stroke: #fafafa;
}
.theme--dark svg path {
  stroke: #303030;
}
</style>

<style lang="scss" scoped>
.chart-graph {
  position: relative;
  > .wrapper > svg {
    vertical-align: bottom;
  }
  > .overlay {
    background-color: white;
    bottom: 0;
    left: 0;
    opacity: 0.6;
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
