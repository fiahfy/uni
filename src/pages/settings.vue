<template>
  <v-container class="settings">
    <v-subheader class="pl-0">GENERAL</v-subheader>
    <v-checkbox v-model="darkTheme" class="mt-0" label="Use Dark Theme" />

    <v-subheader class="pl-0">SCAN</v-subheader>
    <v-text-field
      v-model="refreshInterval"
      type="number"
      required
      label="Refresh Interval"
      min="1000"
      step="1000"
      suffix="ms"
    />
  </v-container>
</template>

<script>
export default {
  computed: {
    darkTheme: {
      get() {
        return this.$store.state.settings.darkTheme
      },
      set(value) {
        this.$store.commit('settings/setDarkTheme', { darkTheme: value })
      }
    },
    refreshInterval: {
      get() {
        return this.$store.state.settings.refreshInterval
      },
      set(value) {
        if (value < 1000) {
          value = 1000
        }
        this.$store.commit('settings/setRefreshInterval', {
          refreshInterval: value
        })
      }
    }
  }
}
</script>
