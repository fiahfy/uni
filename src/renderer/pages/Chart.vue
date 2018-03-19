<template>
  <div class="explorer">
    <div class="menu">
      <p>{{ status }}</p>
      <div>
        <mdc-button @click="selectDirectory" v-if="!progress">Scan</mdc-button>
        <mdc-button @click="cancel" v-else>Cancel</mdc-button>
      </div>
      <p>{{ time }}</p>
    </div>
    <graph />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import MdcButton from '../components/MdcButton'
import Graph from '../components/Graph'
import { Status } from '../store/chart'

export default {
  components: {
    FileList,
    MdcButton,
    Graph
  },
  data () {
    return {
      time: 0
    }
  },
  computed: {
    progress () {
      return this.status === Status.progress
    },
    ...mapState({
      status: state => state.chart.status
    })
  },
  mounted () {
    window.setInterval(() => {
      this.time = new Date()
    }, 0)
  },
  methods: mapActions({
    selectDirectory: 'selectDirectory',
    cancel: 'cancel'
  })
}
</script>

<style scoped lang="scss">
.explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  .menu {
    text-align: center;
  }
  .graph {
    flex: 1;
  }
}
</style>
