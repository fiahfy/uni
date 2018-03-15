<template>
  <div class="explorer">
    <div>
      <p>{{ status }}</p>
      <div>
        <mdc-button @click="selectDirectory">Open</mdc-button>
        <mdc-button @click="cancel">Cancel</mdc-button>
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
// import { Status } from '../store'

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
    done () {
      return false// this.status === Status.done
    },
    ...mapState({
      status: state => state.status
    }),
    ...mapState('explorer', [
      'error'
    ])
  },
  mounted () {
    window.setInterval(() => {
      this.time = new Date()
    }, 0)
  },
  methods: mapActions([
    'selectDirectory',
    'cancel'
  ])
}
</script>

<style scoped lang="scss">
.explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  &>div {
    text-align: center;
  }
  .graph {
    flex: 1;
  }
}
</style>
