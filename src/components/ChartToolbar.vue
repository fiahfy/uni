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
import status from '~/consts/status'

export default {
  computed: {
    directoryInput: {
      get() {
        return this.$store.state.local.directoryInput
      },
      set(value) {
        this.$store.commit('local/setDirectoryInput', {
          directoryInput: value
        })
      }
    },
    scanning() {
      return [status.PROGRESS, status.CANCELLING].includes(this.status)
    },
    title() {
      return this.status === status.CANCELLING ? 'Cancelling' : 'Cancel'
    },
    disabled() {
      return this.status === status.CANCELLING
    },
    ...mapState('local', ['status'])
  },
  methods: {
    onPrependClick() {
      this.openDirectory()
    },
    ...mapActions('local', ['openDirectory', 'scan', 'cancel'])
  }
}
</script>
