<template>
  <v-toolbar class="chart-toolbar" color="transparent" flat dense>
    <v-btn
      v-if="scanning"
      class="pr-5"
      color="primary"
      :disabled="disabled"
      outline
      round
      @click="onCancelClick"
    >
      <v-icon left>find_in_page</v-icon>
      {{ title }}
    </v-btn>
    <v-btn
      v-else
      class="pr-5"
      color="primary"
      :title="'Scan' | accelerator('CmdOrCtrl+O')"
      depressed
      round
      @click="onScanClick"
    >
      <v-icon left>find_in_page</v-icon>
      Scan
    </v-btn>

    <v-spacer />

    <v-btn
      class="ma-0"
      :title="'Settings' | accelerator('CmdOrCtrl+,')"
      flat
      icon
      @click="onSettingsClick"
    >
      <v-icon>settings</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import status from '~/consts/status'

export default {
  computed: {
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
    onScanClick() {
      this.selectDirectory()
    },
    onCancelClick() {
      this.cancel()
    },
    onSettingsClick() {
      this.showDialog()
    },
    ...mapMutations(['showDialog']),
    ...mapActions('local', ['selectDirectory', 'cancel'])
  }
}
</script>
