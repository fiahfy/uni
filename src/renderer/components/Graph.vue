<template>
  <div class="graph">
    <ul>
      <li v-for="name of names" :key="name">{{ name }}</li>
    </ul>
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
      names: []
    }
  },
  computed: {
    ...mapGetters({
      getFiles: 'getFiles'
    }),
    ...mapState({
      scannedAt: state => state.scannedAt
    })
  },
  watch: {
    scannedAt () {
      this.update(true)
    }
  },
  mounted () {
    const width = 700
    const height = 700
    this.radius = Math.min(width, height) / 2
    this.color = d3.scaleOrdinal(d3.schemeCategory20)

    this.svg = d3.select(this.$el.querySelector('svg'))
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

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
  },
  methods: {
    update (redraw = false) {
      const files = this.getFiles()

      if (redraw) {
        Array.from(this.$el.querySelectorAll('path')).forEach((el) => el.remove())
      }

      if (!files) {
        return
      }
      const data = files

      const root = d3.hierarchy(data)
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
      this.svg.selectAll('path')
        .data(this.partition(root).descendants())
        .enter().append('path')
        .attr('visibility', (d) => d.depth > depth ? 'visible' : 'hidden')
        .attr('d', this.arc)
        .style('fill', fill)
        .style('fill-rule', 'evenodd')
        .on('mouseover', function (d) {
          // console.log(d.data.name, d)
        })
        .on('click', click)
      console.timeEnd('rendering')
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
  .sunburst {
    flex: 1;
    overflow: scroll;
  }
}
</style>

