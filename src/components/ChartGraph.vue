<template>
  <div ref="graph" class="chart-graph pa-8">
    <div ref="wrapper" class="wrapper fill-height overflow-hidden">
      <svg ref="sunburst" />
    </div>

    <div v-if="state.loading" class="overlay" />

    <v-tooltip
      v-model="state.tooltip.show"
      :position-x="state.tooltip.x"
      :position-y="state.tooltip.y"
      top
      transition="no-animation"
    >
      {{ state.tooltip.text }}<br />
      <small>{{ state.targetSize | prettyBytes }} ({{ percentage }} %)</small>
    </v-tooltip>

    <v-snackbar v-model="state.needsToRefresh" timeout="-1">
      Need to Refresh

      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="handleRefresh">
          Refresh
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import path from 'path'
import { remote, clipboard } from 'electron'
import { debounce } from 'debounce'
import * as d3 from 'd3'
import {
  defineComponent,
  computed,
  ref,
  reactive,
  watch,
  onMounted,
  onUnmounted,
  SetupContext,
} from '@vue/composition-api'
import { scannerStore } from '~/store'

type Props = {
  selectedPaths: string[]
  hoveredPaths: string[]
}

export default defineComponent({
  props: {
    selectedPaths: {
      type: Array,
      default: () => [],
    },
    hoveredPaths: {
      type: Array,
      default: () => [],
    },
  },
  setup(props: Props, context: SetupContext) {
    const state = reactive<{
      loading: boolean
      needsToRefresh: boolean
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
      needsToRefresh: false,
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
      state.color = d3.scaleOrdinal(d3.schemeSet3)
      context.emit('change:color-category', state.color)

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

      state.transition = d3.transition().duration(0)

      update()
    }
    const update = () => {
      state.loading = true

      state.targetSize = 0
      context.emit('change:selected-paths', [])
      context.emit('change:hovered-paths', [])

      if (!node.value) {
        Array.from(graph.value!.querySelectorAll('svg path')).forEach((el) =>
          el.remove()
        )
        state.loading = false
        return
      }
      const root = d3.hierarchy(node.value)

      state.root = root
      state.depth = 0
      state.targetSize = root.value ?? 0

      if (!state.svg) {
        return
      }

      const path = state
        .svg!.selectAll('path')
        .data(state.partition!(root).descendants(), (d: any) => d)

      path
        .exit()
        .style('opacity', 1)
        .interrupt()
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
        .on('mousemove', handleMouseMove)
        .on('mouseleave', handleMouseLeave)
        .on('contextmenu', handleContextMenu)
        .on('click', handleClick)
        .interrupt()
        .transition(state.transition!)
        .style('opacity', 1)

      handleClick(root)

      state.loading = false
      state.needsToRefresh = false
    }
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
    const moveTo = (item: any) => {
      const node = getPaths(item)
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
      const node = getPaths(item)
        .slice(1)
        .reduce((carry: any, name: any) => {
          if (!carry) {
            return carry
          }
          return carry.children.find((c: any) => c.data.name === name)
        }, state.root)

      handleMouseMove(node)
    }
    const unhover = () => {
      handleMouseLeave()
    }
    const changeDepth = (index: number) => {
      const node = [...props.selectedPaths, ...props.hoveredPaths]
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
      if (state.needsToRefresh && !document.hidden && state.depth === 0) {
        update()
      }
    }
    const handleResize = () => {
      state.debounced!()
    }
    const handleMouseMove = (d: any) => {
      if (d.depth === 0) {
        return
      }
      const ancestors = d.ancestors().reverse()

      const hoveredPaths = ancestors
        .slice(props.selectedPaths.length + 1)
        .map((d: any) => d.data.name)
      context.emit('change:hovered-paths', hoveredPaths)

      state.targetSize = d.value

      state
        .svg!.selectAll('path')
        .style('opacity', 0.5)
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
      context.emit('change:hovered-paths', [])
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
        ...props.selectedPaths,
        ...ancestors
          .slice(props.selectedPaths.length + 1)
          .map((d: any) => d.data.name),
      ].join(path.sep)

      context.root.$contextMenu.open([
        {
          label: 'Open',
          click: () => remote.shell.openItem(filePath),
        },
        { type: 'separator' },
        {
          label: 'Copy Path',
          click: () => clipboard.writeText(filePath),
        },
      ])
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
      const selectedPaths = ancestors.slice(1).map((d: any) => d.data.name)
      context.emit('change:selected-paths', selectedPaths)
      context.emit('change:hovered-paths', [])

      d3.interrupt(graph.value!.querySelector('svg g'))
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
    const handleRefresh = () => {
      update()
    }

    watch(
      () => node.value,
      () => {
        if (!state.needsToRefresh && !document.hidden && state.depth === 0) {
          update()
        } else {
          state.needsToRefresh = true
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
      handleRefresh,
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
