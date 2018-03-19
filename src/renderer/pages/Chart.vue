<template>
  <div class="explorer">
    <div class="menu">
      <mdc-button
        v-if="!progress"
        @click="selectDirectory"
      >Scan</mdc-button>
      <mdc-button
        v-else
        @click="cancel"
      >Cancel</mdc-button>
      <span>Status: {{ status }}</span>
      <span>Time: {{ time }} sec</span>
    </div>
    <div
      v-if="progress"
      class="scanning"
    >
      {{ currentFilepath }}
    </div>
    <graph />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
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
      status: state => state.chart.status,
      currentFilepath: state => state.chart.currentFilepath
    }),
    ...mapGetters({
      getScanTime: 'chart/getScanTime'
    })
  },
  mounted () {
    window.setInterval(() => {
      this.time = (this.getScanTime() / 1000).toFixed(2)
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
  color: var(--mdc-theme-text-primary-on-background);
  display: flex;
  flex-direction: column;
  height: 100%;
  .menu {
    padding: 8px;
    text-align: center;
    &>* {
      margin: 0 8px;
    }
    span {
      display: inline-block;
      line-height: 36px;
      vertical-align: bottom;
    }
  }
  .scanning {
    padding: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .graph {
    flex: 1;
  }
}
</style>
