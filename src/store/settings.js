export const state = () => ({
  darkTheme: false,
  refreshInterval: 5000,
  ignorePathes: []
})

export const mutations = {
  setDarkTheme(state, { darkTheme }) {
    state.darkTheme = darkTheme
  },
  setRefreshInterval(state, { refreshInterval }) {
    state.refreshInterval = refreshInterval
  },
  addIgnorePath(state, { ignorePath }) {
    if (!state.ignorePathes.includes(ignorePath)) {
      state.ignorePathes = [...state.ignorePathes, ignorePath]
    }
  },
  removeIgnorePath(state, { ignorePath }) {
    state.ignorePathes = state.ignorePathes.filter(
      (path) => path !== ignorePath
    )
  }
}
