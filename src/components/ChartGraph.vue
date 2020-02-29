<template>
  <div class="chart-graph pa-3">
    <div ref="wrapper" class="wrapper fill-height hide-overflow">
      <svg ref="sunburst" />
    </div>

    <div v-if="loading" class="overlay" />

    <v-tooltip
      v-model="tooltip.show"
      :position-x="tooltip.x"
      :position-y="tooltip.y"
      top
    >
      <p class="ma-0">
        {{ tooltip.text }}<br />
        <small>{{ targetSize | prettyBytes }} ({{ percentage }} %)</small>
      </p>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import path from 'path'
import * as d3 from 'd3'
import { debounce } from 'debounce'
import { Vue, Component, Ref, Watch } from 'vue-property-decorator'
import { scannerStore } from '~/store'

@Component
export default class ChartContainer extends Vue {
  @Ref() readonly wrapper!: HTMLDivElement
  @Ref() readonly sunburst!: any

  loading = false
  needsUpdate = false
  targetSize = 0
  tooltip = {
    show: false,
    x: 0,
    y: 0,
    text: ''
  }

  depth = 0
  resizeObserver!: ResizeObserver
  debounced!: ReturnType<typeof debounce>
  svg!: d3.Selection<SVGGElement, unknown, null, undefined>
  transition!: d3.Transition<any, unknown, null, undefined>
  width = 0
  height = 0
  radius = 0
  color!: d3.ScaleOrdinal<string, string>
  x!: d3.ScaleLinear<number, number>
  y!: d3.ScalePower<number, number>
  arc!: d3.Arc<any, d3.DefaultArcObject>
  partition!: d3.PartitionLayout<any>
  root!: d3.HierarchyNode<any>

  get percentage() {
    return ((this.targetSize / scannerStore.totalSize) * 100).toFixed(2)
  }

  get node() {
    return scannerStore.data
  }

  @Watch('node')
  onNodeChanged() {
    if (document.hidden) {
      this.needsUpdate = true
    } else {
      this.update()
    }
  }

  mounted() {
    window.addEventListener('visibilitychange', this.onVisibilitychange)
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(this.wrapper)
    this.debounced = debounce(() => {
      this.setup()
    }, 500)
    this.debounced()
  }

  destroyed() {
    window.removeEventListener('visibilitychange', this.onVisibilitychange)
    this.resizeObserver.disconnect()
  }

  onResize() {
    this.debounced()
  }

  onVisibilitychange() {
    if (!document.hidden && this.needsUpdate) {
      this.update()
    }
  }

  onMouseOver(d: any) {
    if (d.depth === 0) {
      return
    }
    const ancestors = d.ancestors().reverse()

    const hoveredNames = ancestors
      .slice(scannerStore.selectedNames.length + 1)
      .map((d: any) => d.data.name)
    scannerStore.setHoveredNames({ hoveredNames })

    this.targetSize = d.value

    this.svg
      .selectAll('path')
      .style('opacity', 0.3)
      .filter((d) => ancestors.includes(d))
      .style('opacity', 1)

    if (!d3.event) {
      return
    }

    this.tooltip.show = true
    this.tooltip.x = d3.event.clientX
    this.tooltip.y = d3.event.clientY
    this.tooltip.text = d.data.name
  }

  onMouseLeave() {
    scannerStore.setHoveredNames({ hoveredNames: [] })
    this.targetSize = scannerStore.totalSize

    this.svg.selectAll('path').style('opacity', 1)

    this.tooltip.show = false
  }

  onContextMenu(d: any) {
    if (d.depth === 0) {
      return
    }
    const ancestors = d.ancestors().reverse()
    const filePath = [
      scannerStore.rootPathHasNoTrailingSlash,
      ...scannerStore.selectedNames,
      ...ancestors
        .slice(scannerStore.selectedNames.length + 1)
        .map((d: any) => d.data.name)
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

  onClick(d: any) {
    if (!d.children) {
      return
    }
    if (this.depth === d.depth && d.parent) {
      d = d.parent
    }
    const ancestors = d.ancestors().reverse()

    this.depth = d.depth
    const selectedNames = ancestors.slice(1).map((d: any) => d.data.name)
    scannerStore.setSelectedNames({ selectedNames })
    scannerStore.setHoveredNames({ hoveredNames: [] })

    this.svg
      .transition(this.transition)
      .tween('scale', () => {
        const xd = d3.interpolate(this.x.domain(), [d.x0, d.x1])
        const yd = d3.interpolate(this.y.domain(), [d.y0, 1])
        const yr = d3.interpolate(this.y.range(), [0, this.radius])
        return (t: any) => {
          this.x.domain(xd(t))
          this.y.domain(yd(t)).range(yr(t))
        }
      })
      .selectAll('path')
      .attrTween('d', (d) => () => this.arc(d))
  }

  setup() {
    this.$el.querySelector('svg g')?.remove()

    this.sunburst.setAttribute('width', 0)
    this.sunburst.setAttribute('height', 0)

    this.width = this.wrapper.offsetWidth
    this.height = this.wrapper.offsetHeight
    this.radius = Math.min(this.width, this.height) / 2
    this.color = d3.scaleOrdinal(d3.schemePaired)
    scannerStore.setColorTable({ colorTable: this.color })

    this.x = d3.scaleLinear().range([0, 2 * Math.PI])
    this.y = d3.scaleSqrt().range([0, this.radius])
    this.arc = d3
      .arc()
      .startAngle((d: any) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x0))))
      .endAngle((d: any) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x1))))
      .innerRadius((d: any) => Math.max(0, this.y(d.y0)))
      .outerRadius((d: any) => Math.max(0, this.y(d.y1)))

    this.svg = d3
      .select(this.$el.querySelector('svg'))
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`)

    this.partition = d3.partition()

    this.transition = d3.transition().duration(300)

    this.update()
  }

  update() {
    this.targetSize = 0
    scannerStore.setHoveredNames({ hoveredNames: [] })
    scannerStore.setSelectedNames({ selectedNames: [] })

    this.loading = true

    if (!this.node) {
      Array.from(this.$el.querySelectorAll('svg path')).forEach((el) =>
        el.remove()
      )
      this.loading = false
      return
    }
console.log(this.node)
    const root = d3.hierarchy(this.node)

    this.root = root
    this.depth = 0
    this.targetSize = root.value ?? 0

    const path = this.svg
      .selectAll('path')
      .data(this.partition(root).descendants(), (d) => d)

    path
      .exit()
      .style('opacity', 1)
      .transition(this.transition)
      .style('opacity', 0)
      .remove()

    path
      .enter()
      .append('path')
      // .merge(path)
      .attr('d', this.arc)
      .style('fill', (d: any) =>
        d.depth === 0
          ? 'transparent'
          : this.color((d.children ? d : d.parent).data.name)
      )
      .style('fill-rule', 'evenodd')
      .style('cursor', (d: any) => (d.children ? 'pointer' : 'auto'))
      .style('opacity', 0)
      .on('mouseover', this.onMouseOver)
      .on('mouseleave', this.onMouseLeave)
      .on('contextmenu', this.onContextMenu)
      .on('click', this.onClick)
      .transition(this.transition)
      .style('opacity', 1)

    this.onClick(root)

    this.loading = false
    this.needsUpdate = false
  }

  moveTo(item: any) {
    const node = scannerStore
      .getPaths(item)
      .slice(1)
      .reduce((carry: any, name: any) => {
        if (!carry) {
          return carry
        }
        return carry.children.find((c: any) => c.data.name === name)
      }, this.root)

    this.onClick(node)
  }

  hover(item: any) {
    const node = scannerStore
      .getPaths(item)
      .slice(1)
      .reduce((carry: any, name: any) => {
        if (!carry) {
          return carry
        }
        return carry.children.find((c: any) => c.data.name === name)
      }, this.root)

    this.onMouseOver(node)
  }

  unhover() {
    this.onMouseLeave()
  }

  changeDepth(index: number) {
    const node = [...scannerStore.selectedNames, ...scannerStore.hoveredNames]
      .slice(0, index)
      .reduce((carry: any, name: any) => {
        if (!carry) {
          return carry
        }
        return carry.children.find((c: any) => c.data.name === name)
      }, this.root)

    if (this.depth === node.depth) {
      return
    }

    this.onClick(node)
  }
}
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
