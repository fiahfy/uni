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
      <p>{{ status }}</p>
      <div>
        <mdc-button @click="selectDirectory">Open</mdc-button>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import FileList from '../components/FileList'
import MdcButton from '../components/MdcButton'
import MenuBar from '../components/MenuBar'
import { Status } from '../store'

export default {
  components: {
    FileList,
    MdcButton,
    MenuBar
  },
  computed: {
    done () {
      return this.status === Status.done
    },
    ...mapState([
      'status'
    ]),
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
