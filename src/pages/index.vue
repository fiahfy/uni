<template>
  <v-container class="index" fluid pa-0>
    <div class="d-flex flex-column flex-grow-1 overflow-hidden fill-height">
      <!-- <alert-bar />
      <chart-toolbar class="flex-grow-0" />
      <chart-container class="flex-grow-1" /> -->
    </div>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
// import AlertBar from '~/components/AlertBar.vue'
// import ChartContainer from '~/components/ChartContainer.vue'
// import ChartToolbar from '~/components/ChartToolbar.vue'

@Component({
  components: {
    // AlertBar,
    // ChartContainer,
    // ChartToolbar
  }
})
export default class Index extends Vue {}
</script>
