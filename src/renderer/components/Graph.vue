<template>
  <div class="graph">
    <div
      v-if="message"
      class="message"
    >
      {{ message }}
    </div>
    <div class="sunburst">
      <svg />
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
import { Status } from '../store/chart'
import * as ContextMenu from '../utils/context-menu'

export default {
  data () {
    return {
      sep: path.sep,
      names: [],
      childNames: [],
      size: 0,
      totalSize: 0,
      available: false
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
      return [...this.scanedPathes, ...this.names, ...this.childNames.slice(1)]
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
      this.node = this.getNode()
      this.update(this.node)
    }
  },
  mounted () {
    this.width = 512
    this.height = 512
    this.radius = Math.min(this.width, this.height) / 2
    this.color = d3.scaleOrdinal(d3.schemeCategory20)

    this.svg = d3.select(this.$el.querySelector('svg'))
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`)

    this.partition = d3.partition()

    this.x = d3.scaleLinear()
      .range([0, 2 * Math.PI])
    this.y = d3.scaleSqrt()
      .range([0, this.radius])
    this.arc = d3.arc()
      .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x0))))
      .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x1))))
      .innerRadius((d) => Math.max(0, this.y(d.y0)))
      .outerRadius((d) => Math.max(0, this.y(d.y1)))

    this.node = this.getNode()
    this.update(this.node)
  },
  methods: {
    update (node) {
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

      this.size = this.totalSize = root.value

      // const t = d3.transition()
      //   .duration(750)

      const path = this.svg.selectAll('path')
        .data(this.partition(root).descendants())

      path.exit()
        .remove()

      // path
      //   .transition(t)
      //   .attrTween('d', (d) => () => this.arc(d))

      path
        .enter().append('path')
        .merge(path)
        // .attr('visibility', (d) => d.depth > depth ? 'visible' : 'hidden')
        .attr('d', this.arc)
        .style('fill', (d) => d.depth === 0 ? 'transparent' : this.color((d.children ? d : d.parent).data.name))
        .style('fill-rule', 'evenodd')
        .style('opacity', 1)
        .style('cursor', (d) => d.children ? 'pointer' : 'auto')
        .on('mouseover', this.mouseover)
        .on('mouseleave', this.mouseleave)
        .on('contextmenu', this.contextmenu)
        .on('click', this.click)

      console.timeEnd('rendering')
    },
    mouseover (d) {
      if (d.depth === 0) {
        return
      }
      const ancestors = d.ancestors().reverse()

      this.childNames = ancestors.map((d) => d.data.name)
      this.size = d.value

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
      const filepath = [...this.scanedPathes, ...this.names, ...ancestors.map((d) => d.data.name).slice(1)].join(path.sep)

      ContextMenu.show(d3.event, [
        { label: 'Open', click: () => { this.open({ filepath }) } }
      ])
    },
    click (d) {
      if (d.depth === 0) {
        this.names = this.names.slice(0, this.names.length - 1)
      } else if (!d.children) {
        return
      } else {
        const ancestors = d.ancestors().reverse()
        this.names = [...this.names, ...ancestors.map((d) => d.data.name).slice(1)]
      }
      this.childNames = []
      const node = this.names.reduce((carry, name) => {
        if (!carry) {
          return carry
        }
        return carry.children.find((c) => c.name === name)
      }, this.node)
      this.update(node)
      // if (!d.children) {
      //   return
      // }
      // if (depth === d.depth && d.parent) {
      //   d = d.parent
      // }
      // depth = d.depth

      // this.svg.transition()
      //   .duration(750)
      //   .tween('scale', () => {
      //     const xd = d3.interpolate(this.x.domain(), [d.x0, d.x1])
      //     const yd = d3.interpolate(this.y.domain(), [d.y0, 1])
      //     const yr = d3.interpolate(this.y.range(), [0, this.radius])
      //     return (t) => {
      //       this.x.domain(xd(t))
      //       this.y.domain(yd(t)).range(yr(t))
      //     }
      //   })
      //   .selectAll('path')
      //   .attrTween('d', (d) => () => this.arc(d))
      //   .style('fill', fill)
    },
    pathClick (e, index) {
      if (index < this.scanedPathes.length - 1) {
        index = this.scanedPathes.length - 1
      }
      this.names = this.pathes.slice(this.scanedPathes.length, index + 1)
      const node = this.names.reduce((carry, name) => {
        if (!carry) {
          return carry
        }
        return carry.children.find((c) => c.name === name)
      }, this.node)
      this.update(node)
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
