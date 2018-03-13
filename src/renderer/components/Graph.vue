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
    ...mapState({
      files: state => state.files
    }),
    ...mapGetters({
      files: 'files'
    })
  },
  mounted () {
    this.update()
  },
  methods: {
    update () {
      if (!this.files) {
        return
      }
      console.log('4 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))
      let size = this.files.reduce((carry, file) => {
        return carry + file.size
      }, 0)
      console.log('5 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))
      const files = this.files//.filter((file) => file.name !== 'node_modules')
      console.log('6 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))
      const data = {name: 'root', children: files}
      console.log('7 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))
      console.log(data)
      console.log('8 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))

      let width = 960
      let height = 700
      let radius = Math.min(width, height) / 2
      let color = d3.scaleOrdinal(d3.schemeCategory20)

      let svg = d3.select(this.$el.querySelector('svg'))
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height * 0.52})`)

      let partition = d3.partition()

      let x = d3.scaleLinear()
        .range([0, 2 * Math.PI])

      let y = d3.scaleSqrt()
        .range([0, radius])
      let arc = d3.arc()
        .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, x(d.x0))))
        .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, x(d.x1))))
        .innerRadius((d) => Math.max(0, y(d.y0)))
        .outerRadius((d) => Math.max(0, y(d.y1)))

      let depth = 0
      console.log('9 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))

      console.log(data)
      console.log('91 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))

      let root = d3.hierarchy(data)
        .sum((d) => d.isDirectory ? 0 : d.size)
        .each((d) => {
          // d._children = d.children

          if (d.depth > depth + 11) {
            d.children = null
            return
          }
          if (!d.children) {
            return
          }
          if (d.depth === depth) {
            return
          }
          // if (d.data.name === 'node_modules') {
          //   d.children = null
          //   return
          // }
          d.children = d.children.filter((c) => c.value / size > 0.001)
          // const children = []
          // d.children.forEach((c) => {
          //   console.log(d.value / size)
          //   if (d.value / size > 0.001) {
          //     children.push(c)
          //   }
          // })
          // d.children = children

          // d.value = d.children.reduce((c, p) => { console.log(p.value);return p.value + c }, 0)
        })
        .sum((d) => d.isDirectory ? 0 : d.size)
        // .children((d, depth) => {
        //   return null
        // })
        // .sort(function(a, b) { return b.value - a.value })
      console.log('10 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))

      let fill = (d) => { return d.depth > depth ? color((d.children ? d : d.parent).data.name) : 'white' }
      console.log('11 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))
      let click = (d) => {
        if (!d.children) {
          return
        }
        if (depth === d.depth && d.parent) {
          d = d.parent
        }
        depth = d.depth

        svg.transition()
          .duration(750)
          .tween('scale', () => {
            let xd = d3.interpolate(x.domain(), [d.x0, d.x1])
            let yd = d3.interpolate(y.domain(), [d.y0, 1])
            let yr = d3.interpolate(y.range(), [0, radius])
            return (t) => {
              x.domain(xd(t))
              y.domain(yd(t)).range(yr(t))
            }
          })
          .selectAll('path')
          .attrTween('d', (d) => () => arc(d))
          .style('fill', fill)
      }

      console.log('12 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))
      svg.selectAll('path')
        .data(partition(root).descendants())
        .enter().append('path')
        // .attr('display', (d) => {
        //   // console.log((d.value / size))
        //   // return 'none'
        //   return d.value / size < 0.01 ? 'none' : null
        // })
        .attr('d', arc)
        .style('stroke', 'white')
        .style('fill', fill)
        .style('fill-rule', 'evenodd')
        .on('mouseover', function (d) {
          console.log(d.data.name, d)
        })
        .on('click', click)
      console.log('13 ' + ('00' + (new Date()).getMinutes()).slice(-2) + ':' + ('00' + (new Date()).getSeconds()).slice(-2))
    }
  }
}
</script>

<style scoped>
svg {

}
</style>
