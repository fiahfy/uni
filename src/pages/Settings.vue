<template>
  <v-container class="settings">
    <v-subheader>General</v-subheader>
    <v-container>
      <v-checkbox
        v-model="darkTheme"
        label="Use dark theme"
      />
    </v-container>

    <v-subheader>Scan</v-subheader>
    <v-container>
      <v-text-field
        v-model="refreshInterval"
        label="Refresh interval"
        type="number"
        min="1000"
        step="1000"
        required
        suffix="ms"
      />
    </v-container>
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
