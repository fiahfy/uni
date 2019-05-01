<template>
  <v-card tile flat>
    <v-card-title class="py-2">
      <span>Total size: {{ totalSize | readableSize }}</span>
    </v-card-title>
    <v-card-actions>
      <div class="pa-2">
        <v-chip
          v-for="(p, index) of paths"
          :key="index"
          @click="(e) => onChipClick(e, index)"
        >
          {{ p }}{{ sep }}
        </v-chip>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import path from 'path'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      sep: path.sep
    }
  },
  computed: {
    paths() {
      if (this.rootPath === null) {
        return [''] // set dummy value for ensuring height
      }
      return [this.rootPath, ...this.selectedPaths, ...this.focusedPaths]
    },
    ...mapState({
      rootPath: (state) => {
        // Remove trailing seperator
        const rootPath = state.local.rootPath
        if (rootPath && rootPath.slice(-1) === path.sep) {
          return rootPath.slice(0, rootPath.length - 1)
        }
        return rootPath
      }
    }),
    ...mapState('local', ['selectedPaths', 'focusedPaths', 'totalSize'])
  },
  methods: {
    onChipClick(e, index) {
      const node = this.paths.slice(1, index + 1).reduce((carry, name) => {
        if (!carry) {
          return carry
        }
        return carry.children.find((c) => c.data.name === name)
      }, this.root)

      if (this.depth === node.depth) {
        return
      }

      this.onClick(node)
    }
  }
}
</script>

<style scoped lang="scss">
.v-card > .v-card__actions {
  overflow: auto;
  padding: 0;
  > div {
    white-space: nowrap;
  }
}
</style>
