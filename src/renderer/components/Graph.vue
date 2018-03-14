<template>
  <div class="graph">
    <svg />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as d3 from 'd3'

export default {
  computed: {
    ...mapGetters({
      getFiles: 'getFiles'
    }),
    ...mapState({
      scannedAt: state => state.scannedAt
    })
  },
  mounted () {
    const width = 960
    const height = 700
    const radius = Math.min(width, height) / 2
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
      .range([0, radius])
    this.arc = d3.arc()
      .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x0))))
      .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x1))))
      .innerRadius((d) => Math.max(0, this.y(d.y0)))
      .outerRadius((d) => Math.max(0, this.y(d.y1)))

    this.update()
  },
  watch: {
    scannedAt () {
      this.update(true)
    }
  },
  methods: {
    update (redraw = false) {
      const files = this.getFiles()
      console.log(files)

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
      const fill = (d) => { return d.depth > depth ? this.color((d.children ? d : d.parent).data.name) : '#fcc' }
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
            let xd = d3.interpolate(this.x.domain(), [d.x0, d.x1])
            let yd = d3.interpolate(this.y.domain(), [d.y0, 1])
            let yr = d3.interpolate(this.y.range(), [0, this.radius])
            return (t) => {
              this.x.domain(xd(t))
              this.y.domain(yd(t)).range(yr(t))
            }
          })
          .selectAll('path')
          .attrTween('d', (d) => () => this.arc(d))
          .style('fill', fill)
      }

      if (redraw) {
        console.log('redraw')
        console.log(root)
        this.svg.selectAll('path')
          .data(this.partition(root).descendants())
        click(root)
        return
      }

      console.log('Begin rendering ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))
      this.svg.selectAll('path')
        .data(this.partition(root).descendants())
        .enter().append('path')
        // .attr('display', (d) => {
        //   // console.log((d.value / size))
        //   // return 'none'
        //   return d.value / size < 0.01 ? 'none' : null
        // })
        .attr('d', this.arc)
        .style('stroke', 'white')
        .style('fill', fill)
        .style('fill-rule', 'evenodd')
        .on('mouseover', function (d) {
          // console.log(d.data.name, d)
        })
        .on('click', click)
      console.log('End rendering ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))
    }
  }
}
</script>

<style scoped>
svg {

}
</style>
