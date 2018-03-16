<template>
  <div class="graph">
    <div>
      <div>{{ currentFilepath }}</div>
      <div>{{ time }} sec</div>
      <ul>
        <li
          v-for="name of names"
          :key="name"
        >{{ name }}</li>
      </ul>
      <div class="info">
        {{ size }} ({{ (rate * 100).toFixed(2) }} %)
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
      time: 0,
      size: 0,
      rate: 0
    }
  },
  computed: {
    ...mapGetters({
      getNode: 'getNode',
      getElapsedTime: 'getElapsedTime'
    }),
    ...mapState({
      scannedAt: state => state.scannedAt,
      currentFilepath: state => state.currentFilepath
    })
  },
  watch: {
    scannedAt () {
      this.update()
    }
  },
  mounted () {
    this.width = 700
    this.height = 700
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

    this.update()

    window.setInterval(() => {
      this.time = (this.getElapsedTime() / 1000).toFixed(2)
    }, 0)
  },
  methods: {
    update () {
      const node = this.getNode()
      if (!node) {
        return
      }

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
        if (!d.children) {
          return
        }
        if (depth === d.depth && d.parent) {
          d = d.parent
        }
        depth = d.depth

        this.svg.transition()
          .duration(750)
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
          .style('fill', fill)
      }

      console.time('rendering')
      const path = this.svg.selectAll('path')
        .data(this.partition(root).descendants())
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
      path.exit().remove()
      console.timeEnd('rendering')
    },
    mouseover (d) {
      const ancestors = d.ancestors().reverse()
      const ancestor = ancestors[0]

      this.names = ancestors.map((d) => d.data.name)
      this.size = d.data.sum
      this.rate = d.data.sum / ancestor.data.sum

      this.svg.selectAll('path')
        .style('opacity', 0.3)
        .filter((d) => ancestors.indexOf(d) >= 0)
        .style('opacity', 1)
    },
    mouseleave (d) {
      this.svg.selectAll('path')
        .style('opacity', 1);
    }
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
  ul {
    padding: 0;
    li {
      display: inline-block;
      list-style: none;
      margin: 8px;
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
