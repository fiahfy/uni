<template>
  <v-navigation-drawer class="activity-bar" mini-variant permanent app>
    <v-list class="pt-0">
      <v-list-tile
        v-for="item in items"
        :key="item.id"
        :title="item.title | accelerator(item.accelerator)"
        @click="(e) => onItemClick(e, item)"
      >
        <v-list-tile-action>
          <v-icon :color="getColor(item)">{{ item.icon }}</v-icon>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { Name } from '~/router'

export default {
  data() {
    return {
      items: [
        {
          id: 1,
          icon: 'pie_chart',
          title: 'Chart',
          accelerator: 'CmdOrCtrl+Shift+C',
          location: { name: Name.chart }
        },
        {
          id: 2,
          icon: 'settings',
          title: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          location: { name: Name.settings }
        }
      ]
    }
  },
  methods: {
    onItemClick(e, item) {
      this.$router.push(item.location)
    },
    getColor(item) {
      return this.getActive(item) ? 'primary' : null
    },
    getActive(item) {
      return item.location.name === this.$route.name
    }
  }
}
</script>
