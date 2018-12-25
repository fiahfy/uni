<template>
  <v-layout class="chart-container" column>
    <v-flex ref="wrapper" class="ma-3">
      <svg ref="sunburst" />
      <div v-if="loading" class="loading" />
    </v-flex>

    <v-card tile flat :style="{ visibility: totalSize ? 'visible' : 'hidden' }">
      <v-card-title class="py-2">
        <span>Total size: {{ totalSize | readableSize }}</span>
      </v-card-title>
      <v-card-actions>
        <div class="pa-2">
          <v-chip
            v-for="(p, index) of pathes"
            :key="index"
            @click="(e) => onChipClick(e, index)"
          >
            {{ p }}{{ sep }}
          </v-chip>
        </div>
      </v-card-actions>
    </v-card>

    <div v-if="!totalSize" class="overlay">
      <v-layout align-center justify-center fill-height>
        <v-flex class="text-xs-center caption">{{ noDataText }}</v-flex>
      </v-layout>
    </div>

    <v-tooltip
      v-model="tooltip.show"
      :position-x="tooltip.x"
      :position-y="tooltip.y"
      top
    >
      <p class="ma-0">
        <!-- eslint-disable-next-line vue/html-self-closing -->
        {{ tooltip.text }}<br />
        <small>{{ size | readableSize }} ({{ percentage }} %)</small>
      </p>
    </v-tooltip>
  </v-layout>
</template>

<script>
import path from 'path'
import { mapActions, mapGetters, mapState } from 'vuex'
import * as d3 from 'd3'
import { debounce } from 'debounce'
import status from '~/consts/status'

export default {
  data() {
    return {
      sep: path.sep,
      names: [],
      childNames: [],
      loading: false,
      size: 0,
      totalSize: 0,
      tooltip: {
        show: false,
        x: 0,
        y: 0,
        text: ''
      }
    }
  },
  computed: {
    pathes() {
      if (this.directory === null) {
        return []
      }
      return [this.directory, ...this.names, ...this.childNames]
    },
    percentage() {
      return ((this.size / this.totalSize) * 100).toFixed(2)
    },
    noDataText() {
      return this.status === status.PROGRESS ? 'Scanning...' : 'No data'
    },
    ...mapState({
      directory: (state) => {
        // Remove trailing seperator
        const directory = state.local.directory
        if (directory && directory.slice(-1) === path.sep) {
          return directory.slice(0, directory.length - 1)
        }
        return directory
      }
    }),
    ...mapState('local', ['status', 'updatedAt']),
    ...mapGetters('local', ['getNode'])
  },
  watch: {
    updatedAt() {
      this.setup()
    }
  },
  mounted() {
    this.debounced = debounce(() => {
      this.setup()
    }, 500)
    window.addEventListener('resize', this.onResize)
    this.debounced()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.debounced()
    },
    onMouseOver(d) {
      if (d.depth === 0) {
        return
      }
      const ancestors = d.ancestors().reverse()

      this.childNames = ancestors
        .slice(this.names.length + 1)
        .map((d) => d.data.name)
      this.size = d.value

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
      this.childNames = []
      this.size = this.totalSize

      this.svg.selectAll('path').style('opacity', 1)

      this.tooltip.show = false
    },
    onContextMenu(d) {
      if (d.depth === 0) {
        return
      }
      const ancestors = d.ancestors().reverse()
      const filepath = [
        this.directory,
        ...this.names,
        ...ancestors.slice(this.names.length + 1).map((d) => d.data.name)
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
      this.names = ancestors.slice(1).map((d) => d.data.name)
      this.childNames = []

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
      const node = this.pathes.slice(1, index + 1).reduce((carry, name) => {
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
      if (this.$el.querySelector('g')) {
        this.$el.querySelector('g').remove()
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
      this.names = []
      this.childNames = []
      this.size = this.totalSize = 0

      this.loading = true

      const node = this.getNode()
      if (!node) {
        Array.from(this.$el.querySelectorAll('path')).forEach((el) =>
          el.remove()
        )
        this.loading = false
        return
      }

      const root = d3.hierarchy(node)

      this.root = root
      this.depth = 0
      this.size = this.totalSize = root.value

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
    },
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
.chart-container {
  position: relative;
  .flex {
    position: relative;
    > svg {
      vertical-align: bottom;
    }
    > div {
      &.loading {
        background-color: white;
        bottom: 0;
        left: 0;
        opacity: 0.6;
        position: absolute;
        right: 0;
        top: 0;
      }
    }
  }
  .v-card > .v-card__actions {
    overflow: auto;
    padding: 0;
    > div {
      white-space: nowrap;
    }
  }
  > .overlay {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
  }
}
</style>
