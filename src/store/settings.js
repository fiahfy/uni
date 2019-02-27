export const state = () => ({
  darkTheme: false,
  refreshInterval: 5000,
  ignoredPaths: []
})

export const mutations = {
  setDarkTheme(state, { darkTheme }) {
    state.darkTheme = darkTheme
  },
  setRefreshInterval(state, { refreshInterval }) {
    state.refreshInterval = refreshInterval
  },
  addIgnoredPath(state, { ignoredPath }) {
    if (!state.ignoredPaths.includes(ignoredPath)) {
      state.ignoredPaths = [...state.ignoredPaths, ignoredPath]
    }
  },
  removeIgnoredPath(state, { ignoredPath }) {
    state.ignoredPaths = state.ignoredPaths.filter((path) => path !== ignoredPath)
  }
}
