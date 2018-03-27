<template>
  <div class="graph">
    <div
      v-if="message"
      class="message"
    >
      {{ message }}
    </div>
    <div
      ref="sunburst"
      class="sunburst"
    >
      <svg />
      <div
        v-if="needRefresh"
        class="overlay"
      >
        <div>
          <mdc-button @click="setup">Refresh</mdc-button>
        </div>
      </div>
    </div>
    <div class="info">
      <div>
        Size: {{ size|readableSize }} ({{ (size / totalSize * 100).toFixed(2) }} %)
      </div>
      <ul ref="pathes">
        <li
          v-for="(p, index) of pathes"
          :key="index"
          @click="(e) => pathClick(e, index)"
        >{{ p }}{{ sep }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import path from 'path'
import { mapActions, mapGetters, mapState } from 'vuex'
import * as d3 from 'd3'
import MdcButton from '../components/MdcButton'
import { Status } from '../store/chart'
import * as ContextMenu from '../utils/context-menu'

export default {
  components: {
    MdcButton
  },
  data () {
    return {
      sep: path.sep,
      names: [],
      childNames: [],
      size: 0,
      totalSize: 0,
      available: false,
      needRefresh: false
    }
  },
  computed: {
    message () {
      if (this.status === Status.notYet) {
        return 'Scan folder'
      } else if (this.status === Status.progress && !this.available) {
        return 'Scanning...'
      } else if (!this.available) {
        return 'No data'
      }
      return ''
    },
    pathes () {
      return [...this.scanedPathes, ...this.names, ...this.childNames]
    },
    ...mapState({
      status: state => state.chart.status,
      updatedAt: state => state.chart.updatedAt
    }),
    ...mapGetters({
      scanedPathes: 'chart/scanedPathes',
      getNode: 'chart/getNode'
    })
  },
  watch: {
    updatedAt () {
      this.update()
    }
  },
  mounted () {
    this.setup()
    window.addEventListener('resize', this.resize)
  },
  beforeDestory () {
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    setup () {
      if (this.$el.querySelector('g')) {
        this.$el.querySelector('g').remove()
      }

      this.width = this.$refs.sunburst.offsetWidth
      this.height = this.$refs.sunburst.offsetHeight
      this.radius = Math.min(this.width, this.height) / 2
      this.color = d3.scaleOrdinal(d3.schemeCategory20)

      this.x = d3.scaleLinear()
        .range([0, 2 * Math.PI])
      this.y = d3.scaleSqrt()
        .range([0, this.radius])
      this.arc = d3.arc()
        .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x0))))
        .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x1))))
        .innerRadius((d) => Math.max(0, this.y(d.y0)))
        .outerRadius((d) => Math.max(0, this.y(d.y1)))

      this.svg = d3.select(this.$el.querySelector('svg'))
        .attr('width', this.width)
        .attr('height', this.height)
        .append('g')
        .attr('transform', `translate(${this.width / 2},${this.height / 2})`)

      this.partition = d3.partition()

      this.transition = d3.transition()
        .duration(750)

      this.update()

      this.needRefresh = false
    },
    update () {
      this.names = []
      this.childNames = []
      this.size = this.totalSize = 0

      const node = this.getNode()
      // console.log(node)
      if (!node) {
        this.available = false
        Array.from(this.$el.querySelectorAll('path')).forEach((el) => el.remove())
        return
      }
      this.available = true

      console.time('rendering')

      const root = d3.hierarchy(node)
        .sum((d) => d.size)
      root
        .each((d) => {
          d.data.sum = d.value
          if (d.depth === 0) {
            return
          }
          if (d.depth > 11) {
            d.children = null
            return
          }
          if (!d.children) {
            return
          }
          d.children = d.children.filter((c) => c.value / root.value > 0.001)
        })
        // .sum((d) => d.sum)

      this.root = root
      this.depth = 0
      this.size = this.totalSize = root.data.sum

      const path = this.svg.selectAll('path')
        .data(this.partition(root).descendants(), (d) => d)

      path.exit()
        .style('opacity', 1)
        .transition(this.transition)
        .style('opacity', 0)
        .remove()

      path
        .enter().append('path')
        // .merge(path)
        .attr('d', this.arc)
        .style('fill', (d) => d.depth === 0 ? 'transparent' : this.color((d.children ? d : d.parent).data.name))
        .style('fill-rule', 'evenodd')
        .style('cursor', (d) => d.children ? 'pointer' : 'auto')
        .style('opacity', 0)
        .on('mouseover', this.mouseover)
        .on('mouseleave', this.mouseleave)
        .on('contextmenu', this.contextmenu)
        .on('click', this.click)
        .transition(this.transition)
        .style('opacity', 1)

      this.click(root)

      console.timeEnd('rendering')
    },
    resize () {
      this.needRefresh = true
    },
    mouseover (d) {
      if (d.depth === 0) {
        return
      }
      const ancestors = d.ancestors().reverse()

      this.childNames = ancestors.slice(this.names.length + 1).map((d) => d.data.name)
      this.size = d.data.sum

      this.svg.selectAll('path')
        .style('opacity', 0.3)
        .filter((d) => ancestors.indexOf(d) >= 0)
        .style('opacity', 1)
    },
    mouseleave (d) {
      this.childNames = []
      this.size = this.totalSize

      this.svg.selectAll('path')
        .style('opacity', 1)
    },
    contextmenu (d) {
      if (d.depth === 0) {
        return
      }
      const ancestors = d.ancestors().reverse()
      const filepath = [
        ...this.scanedPathes,
        ...this.names,
        ...ancestors.slice(this.names.length + 1).map((d) => d.data.name)
      ].join(path.sep)

      ContextMenu.show(d3.event, [
        { label: 'Open', click: () => { this.open({ filepath }) } }
      ])
    },
    click (d) {
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
    pathClick (e, index) {
      if (index < this.scanedPathes.length - 1) {
        index = this.scanedPathes.length - 1
      }
      const node = this.pathes
        .slice(this.scanedPathes.length, index + 1)
        .reduce((carry, name) => {
          if (!carry) {
            return carry
          }
          return carry.children.find((c) => c.data.name === name)
        }, this.root)

      if (this.depth === node.depth) {
        return
      }

      this.click(node)
    },
    ...mapActions({
      open: 'chart/open'
    })
  }
}
</script>

<style lang="scss">
svg path {
  stroke: var(--mdc-theme-background);
}
</style>

<style scoped lang="scss">
.graph {
  display: flex;
  flex-direction: column;
  padding-bottom: 84px;
  position: relative;
  .info {
    bottom: 0;
    margin: 8px;
    position: fixed;
    &>div {
      margin: 8px;
    }
    ul {
      margin: 0;
      padding: 8px;
      li {
        color: var(--mdc-theme-primary);
        cursor: pointer;
        display: inline-block;
        list-style: none;
        margin-right: 8px;
      }
    }
  }
  .sunburst {
    align-items: center;
    display: flex;
    flex: 1;
    justify-content: center;
    position: relative;
    .overlay {
      background-color: var(--mdc-theme-background);
      bottom: 0;
      display: table;
      height: 100%;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      vertical-align:middle;
      width: 100%;
      &>div {
        display: table-cell;
        text-align: center;
        vertical-align: middle;
      }
    }
  }
  .message {
    align-items: center;
    background-color: var(--mdc-theme-background);
    bottom: 0;
    color: var(--mdc-theme-text-secondary-on-background);
    display: flex;
    flex: 1;
    justify-content: center;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
  }
}
</style>
