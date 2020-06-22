<template>
  <v-container class="index" fluid pa-0>
    <div class="d-flex flex-column fill-height flex-grow-1 overflow-hidden">
      <toolbar />
      <alert-bar />
      <!-- <chart-toolbar class="flex-grow-0" />
      <chart-container class="flex-grow-1" /> -->
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import AlertBar from '~/components/AlertBar.vue'
// import ChartContainer from '~/components/ChartContainer.vue'
import Toolbar from '~/components/Toolbar.vue'

export default defineComponent({
  components: {
    AlertBar,
    Toolbar,
  },
  setup(_props: {}) {
    return {}
  },
})
</script>
