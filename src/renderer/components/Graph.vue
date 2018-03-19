<template>
  <div class="graph">
    <div>
      <ul>
        <li
          v-for="(p, index) of pathes"
          :key="index"
          @click="(e) => click(e, index)"
        >{{ p }}</li>
      </ul>
      <div class="info">
        {{ size|readableSize }} ({{ (rate * 100).toFixed(2) }} %)
      </div>
    </div>
    <div class="sunburst">
      <svg />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as d3 from 'd3'

export default {
  data () {
    return {
      names: [],
      childNames: [],
      size: 0,
      rate: 0
    }
  },
  computed: {
    pathes () {
      return [...this.rootPathes, ...this.names, ...this.childNames.slice(1)]
    },
    ...mapState({
      scannedAt: state => state.chart.scannedAt
    }),
    ...mapGetters({
      rootPathes: 'chart/rootPathes',
      getNode: 'chart/getNode'
    })
  },
  watch: {
    scannedAt () {
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
        return
      }

      console.time('rendering')
      const root = d3.hierarchy(node)
        .sum((d) => d.size)
        .each((d) => {
          d.data.sum = d.value
        })
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
        .sum((d) => d.size)

      let depth = 0
      const fill = (d) => this.color((d.children ? d : d.parent).data.name)
      const click = (d) => {
        const ancestors = d.ancestors().reverse()
        this.names = [...this.names, ...ancestors.map((d) => d.data.name).slice(1)]
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
      }

      const t = d3.transition()
        .duration(750)

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
        .attr('visibility', (d) => d.depth > depth ? 'visible' : 'hidden')
        .attr('d', this.arc)
        .style('fill', fill)
        .style('fill-rule', 'evenodd')
        .on('mouseover', this.mouseover)
        .on('mouseleave', this.mouseleave)
        .on('click', click)

      console.timeEnd('rendering')
    },
    mouseover (d) {
      const ancestors = d.ancestors().reverse()
      const ancestor = ancestors[0]

      this.childNames = ancestors.map((d) => d.data.name)
      this.size = d.data.sum
      this.rate = d.data.sum / ancestor.data.sum

      this.svg.selectAll('path')
        .style('opacity', 0.3)
        .filter((d) => ancestors.indexOf(d) >= 0)
        .style('opacity', 1)
    },
    mouseleave (d) {
      const ancestors = d.ancestors().reverse()
      const ancestor = ancestors[0]

      this.childNames = []
      this.size = ancestor.data.sum
      this.rate = ancestor.data.sum / ancestor.data.sum

      this.svg.selectAll('path')
        .style('opacity', 1);
    },
    click (e, index) {
      if (index < this.rootPathes.length - 1) {
        index = this.rootPathes.length - 1
      }
      this.names = this.pathes.slice(this.rootPathes.length, index + 1)
      const node = this.names.reduce((carry, name) => {
        if (!carry) {
          return carry
        }
        return carry.children.find((c) => c.name === name)
      }, this.node)
      this.update(node)
    }
  }
}
</script>

<style lang="scss">
svg path {
  cursor: pointer;
  stroke: var(--mdc-theme-background);
}
</style>

<style scoped lang="scss">
.graph {
  display: flex;
  flex-direction: column;
  ul {
    margin: 0;
    padding: 8px;
    li {
      color: var(--mdc-theme-primary);
      cursor: pointer;
      display: inline-block;
      list-style: none;
      &:after {
        color: var(--mdc-theme-text-primary-on-background);
        content: '/';
        margin: 8px;
      }
    }
  }
  .info {
    margin: 8px;
  }
  .sunburst {
    flex: 1;
    overflow: scroll;
    text-align: center;
  }
}
</style>
