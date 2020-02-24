<template>
  <v-container class="index" fluid pa-0>
    <v-layout column>
      <alert-bar />
      <chart-toolbar />
      <v-container fluid pa-0 overflow-hidden>
        <chart-container class="fill-height" />
      </v-container>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import AlertBar from '~/components/AlertBar.vue'
import ChartContainer from '~/components/ChartContainer.vue'
import ChartToolbar from '~/components/ChartToolbar.vue'

@Component({
  components: {
    AlertBar,
    ChartContainer,
    ChartToolbar
  }
})
export default class Index extends Vue {}
</script>
