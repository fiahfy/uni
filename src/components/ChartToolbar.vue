<template>
  <v-toolbar
    class="chart-toolbar"
    flat
    dense
  >
    <v-text-field
      v-model="directoryInput"
      name="directory"
      label="Path"
      prepend-icon="folder"
      single-line
      hide-details
      @click:prepend="onPrependClick"
    />
    <v-btn
      v-if="progress"
      :title="'Scanning'"
      disabled
      @click="cancel"
    >
      Scanning
      <v-icon right>find_in_page</v-icon>
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
      get() {
        return this.$store.state.chart.directoryInput
      },
      set(value) {
        this.$store.commit('chart/setDirectoryInput', { directoryInput: value })
      }
    },
    progress() {
      return this.status === Status.progress
    },
    ...mapState({
      status: (state) => state.chart.status
    })
  },
  methods: {
    onPrependClick() {
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
