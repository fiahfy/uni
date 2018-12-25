<template>
  <v-container class="index" fill-height fluid pa-0>
    <v-layout column>
      <alert-bar />
      <chart-toolbar />
      <v-container fluid pa-0 overflow-hidden>
        <chart-container class="fill-height" />
      </v-container>
    </v-layout>
  </v-container>
</template>

<script>
import AlertBar from '~/components/AlertBar'
import ChartContainer from '~/components/ChartContainer'
import ChartToolbar from '~/components/ChartToolbar'

export default {
  components: {
    AlertBar,
    ChartContainer,
    ChartToolbar
  }
}
</script>
