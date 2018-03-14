<template>
  <div class="explorer">
    <template v-if="done">
      <div class="container">
        <div
          class="error"
          v-if="error">
          <span>{{ error.message }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div>
        <p>{{ status }}</p>
        <div>
          <mdc-button @click="selectDirectory">Open</mdc-button>
          <mdc-button @click="cancel">Cancel</mdc-button>
        </div>
        <p>{{ time }}</p>
      </div>
      <graph style="flex: 1;" />
    </template>
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
  .container {
    flex: 1;
    overflow-y: auto;
    position: relative;
    .message {
      align-items: center;
      bottom: 0;
      color: var(--mdc-theme-text-secondary-on-background);
      display: flex;
      justify-content: center;
      left: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: 0;
    }
  }
}
</style>
