<template>
  <v-toolbar
    class="chart-toolbar"
    flat
    dense
  >
    <v-text-field
      v-model="directoryInput"
      :prepend-icon-cb="prependIconCallback"
      name="directory"
      class="mx-3"
      label="Path"
      prepend-icon="folder"
      single-line
      hide-details
      full-width
      tabindex="-1"
    />
    <v-btn
      v-if="progress"
      :title="'Cancel'"
      @click="cancel"
    >
      Cancel
      <v-icon right>cancel</v-icon>
    </v-btn>
    <v-btn
      v-else
      :title="'Scan'"
      color="primary"
      @click="scan"
    >
      Scan
      <v-icon right>find_in_page</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { Status } from '~/store/chart'

export default {
  computed: {
    directoryInput: {
      get () {
        return this.$store.state.chart.directoryInput
      },
      set (value) {
        this.$store.commit('chart/setDirectoryInput', { directoryInput: value })
      }
    },
    progress () {
      return this.status === Status.progress
    },
    ...mapState({
      status: state => state.chart.status
    })
  },
  methods: {
    prependIconCallback () {
      this.openDirectory()
    },
    ...mapActions({
      openDirectory: 'chart/openDirectory',
      scan: 'chart/scan',
      cancel: 'chart/cancel'
    })
  }
}
</script>

<style scoped lang="scss">
.chart-toolbar /deep/ .input-group--text-field label {
  margin-left: 0;
}
</style>
