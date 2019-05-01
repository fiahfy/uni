<template>
  <div class="chart-graph pa-3">
    <div ref="wrapper" class="wrapper fill-height">
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
        <small>{{ focusedSize | readableSize }} ({{ percentage }} %)</small>
      </p>
    </v-tooltip>
  </div>
</template>

<script>
import path from 'path'
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import * as d3 from 'd3'
import { debounce } from 'debounce'

export default {
  data() {
    return {
      sep: path.sep,
      loading: false,
      needsUpdate: false,
      focusedSize: 0,
      tooltip: {
        show: false,
        x: 0,
        y: 0,
        text: ''
      }
    }
  },
  computed: {
    percentage() {
      return ((this.focusedSize / this.totalSize) * 100).toFixed(2)
    },
    ...mapState({
      rootPath: (state) => {
        // Remove trailing seperator
        const rootPath = state.local.rootPath
        if (rootPath && rootPath.slice(-1) === path.sep) {
          return rootPath.slice(0, rootPath.length - 1)
        }
        return rootPath
      }
    }),
    ...mapState('local', [
      'updatedAt',
      'totalSize',
      'selectedPaths',
      'focusedPaths'
    ]),
    ...mapGetters('local', ['getNode'])
  },
  watch: {
    updatedAt() {
      if (document.hidden) {
        this.needsUpdate = true
      } else {
        this.update()
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this.onResize)
    window.addEventListener('visibilitychange', this.onVisibilitychange)
    this.debounced = debounce(() => {
      this.setup()
    }, 500)
    this.debounced()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('visibilitychange', this.onVisibilitychange)
  },
  methods: {
    onResize() {
      this.debounced()
    },
    onVisibilitychange() {
      if (!document.hidden && this.needsUpdate) {
        this.update()
      }
    },
    onMouseOver(d) {
      if (d.depth === 0) {
        return
      }
      const ancestors = d.ancestors().reverse()

      const focusedPaths = ancestors
        .slice(this.selectedPaths.length + 1)
        .map((d) => d.data.name)
      this.setFocusedPaths({ focusedPaths })

      this.focusedSize = d.value

      this.svg
        .selectAll('path')
        .style('opacity', 0.3)
        .filter((d) => ancestors.indexOf(d) >= 0)
        .style('opacity', 1)

      this.tooltip.show = true
      this.tooltip.x = d3.event.clientX
      this.tooltip.y = d3.event.clientY
      this.tooltip.text = d.data.name
    },
    onMouseLeave() {
      this.setFocusedPaths({ focusedPaths: [] })
      this.focusedSize = this.totalSize

      this.svg.selectAll('path').style('opacity', 1)

      this.tooltip.show = false
    },
    onContextMenu(d) {
      if (d.depth === 0) {
        return
      }
      const ancestors = d.ancestors().reverse()
      const filepath = [
        this.rootPath,
        ...this.selectedPaths,
        ...ancestors
          .slice(this.selectedPaths.length + 1)
          .map((d) => d.data.name)
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
    onClick(d) {
      if (!d.children) {
        return
      }
      if (this.depth === d.depth && d.parent) {
        d = d.parent
      }
      const ancestors = d.ancestors().reverse()

      this.depth = d.depth
      const selectedPaths = ancestors.slice(1).map((d) => d.data.name)
      this.setSelectedPaths({ selectedPaths })
      this.setFocusedPaths({ focusedPaths: [] })

      this.svg
        .transition(this.transition)
        .tween('scale', () => {
          const xd = d3.interpolate(this.x.domain(), [d.x0, d.x1])
          const yd = d3.interpolate(this.y.domain(), [d.y0, 1])
          const yr = d3.interpolate(this.y.range(), [0, this.radius])
          return (t) => {
            this.x.domain(xd(t))
            this.y.domain(yd(t)).range(yr(t))
          }
        })
        .selectAll('path')
        .attrTween('d', (d) => () => this.arc(d))
    },
    onChipClick(e, index) {
      const node = this.paths.slice(1, index + 1).reduce((carry, name) => {
        if (!carry) {
          return carry
        }
        return carry.children.find((c) => c.data.name === name)
      }, this.root)

      if (this.depth === node.depth) {
        return
      }

      this.onClick(node)
    },
    setup() {
      if (this.$el.querySelector('svg g')) {
        this.$el.querySelector('svg g').remove()
      }

      this.$refs.sunburst.setAttribute('width', 0)
      this.$refs.sunburst.setAttribute('height', 0)

      this.width = this.$refs.wrapper.offsetWidth
      this.height = this.$refs.wrapper.offsetHeight
      this.radius = Math.min(this.width, this.height) / 2
      this.color = d3.scaleOrdinal(d3.schemePaired)

      this.x = d3.scaleLinear().range([0, 2 * Math.PI])
      this.y = d3.scaleSqrt().range([0, this.radius])
      this.arc = d3
        .arc()
        .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x0))))
        .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x1))))
        .innerRadius((d) => Math.max(0, this.y(d.y0)))
        .outerRadius((d) => Math.max(0, this.y(d.y1)))

      this.svg = d3
        .select(this.$el.querySelector('svg'))
        .attr('width', this.width)
        .attr('height', this.height)
        .append('g')
        .attr('transform', `translate(${this.width / 2},${this.height / 2})`)

      this.partition = d3.partition()

      this.transition = d3.transition().duration(750)

      this.update()
    },
    update() {
      this.focusedSize = 0
      this.setFocusedPaths({ focusedPaths: [] })
      this.setSelectedPaths({ selectedPaths: [] })
      this.setTotalSize({ totalSize: 0 })

      this.loading = true

      const node = this.getNode()
      if (!node) {
        Array.from(this.$el.querySelectorAll('svg path')).forEach((el) =>
          el.remove()
        )
        this.loading = false
        return
      }

      const root = d3.hierarchy(node)

      this.root = root
      this.depth = 0
      this.focusedSize = root.value
      this.setTotalSize({ totalSize: root.value })

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
        .style('fill', (d) =>
          d.depth === 0
            ? 'transparent'
            : this.color((d.children ? d : d.parent).data.name)
        )
        .style('fill-rule', 'evenodd')
        .style('cursor', (d) => (d.children ? 'pointer' : 'auto'))
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
    },
    ...mapMutations('local', [
      'setTotalSize',
      'setSelectedPaths',
      'setFocusedPaths'
    ]),
    ...mapActions('local', ['browseDirectory', 'writeToClipboard'])
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

<style scoped lang="scss">
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
