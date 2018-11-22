<template>
  <v-toolbar class="chart-toolbar" flat dense>
    <v-text-field
      v-model="directoryInput"
      name="directory"
      class="pt-0"
      label="Path"
      prepend-icon="folder"
      single-line
      hide-details
      @click:prepend="onPrependClick"
    />
    <v-btn v-if="scanning" :disabled="disabled" @click="cancel">
      {{ title }}
      <v-icon right>find_in_page</v-icon>
    </v-btn>
    <v-btn v-else color="primary" @click="scan">
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
    scanning() {
      return [Status.progress, Status.cancelling].includes(this.status)
    },
    title() {
      return this.status === Status.cancelling ? 'Cancelling' : 'Cancel'
    },
    disabled() {
      return this.status === Status.cancelling
    },
    ...mapState('chart', ['status'])
  },
  methods: {
    onPrependClick() {
      this.openDirectory()
    },
    ...mapActions('chart', ['openDirectory', 'scan', 'cancel'])
  }
}
</script>
