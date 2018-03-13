<template>
  <div class="explorer">
    <template v-if="done">
      <menu-bar />
      <div class="container">
        <div class="error" v-if="error">
          <span>{{ error.message }}</span>
        </div>
        <file-list />
      </div>
    </template>
    <template v-else>
      <div>
        <p>{{ status }}</p>
        <div>
          <mdc-button @click="selectDirectory">Open</mdc-button>
        </div>
        <p>{{ time }}</p>
      </div>
      <graph style="flex: 1;" />
    </template>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import FileList from '../components/FileList'
import MdcButton from '../components/MdcButton'
import MenuBar from '../components/MenuBar'
import Graph from '../components/Graph'
import { Status } from '../store'

export default {
  components: {
    FileList,
    MdcButton,
    MenuBar,
    Graph
  },
  data () {
    return {
      time: 0
    }
  },
  mounted () {
    window.setInterval(() => {
      this.time = new Date()
    }, 0)
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
  methods: mapActions([
    'selectDirectory'
  ])
}
</script>

<style scoped lang="scss">
.explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.container {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  position: relative;
}
.error {
  bottom: 0;
  display: table;
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  vertical-align: middle;
  width: 100%;
  span {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
  }
}
</style>
