export const state = () => ({
  darkTheme: false,
  refreshInterval: 5000,
  ignorePaths: []
})

export const mutations = {
  setDarkTheme(state, { darkTheme }) {
    state.darkTheme = darkTheme
  },
  setRefreshInterval(state, { refreshInterval }) {
    state.refreshInterval = refreshInterval
  },
  addIgnorePath(state, { ignorePath }) {
    if (!state.ignorePaths.includes(ignorePath)) {
      state.ignorePaths = [...state.ignorePaths, ignorePath]
    }
  },
  removeIgnorePath(state, { ignorePath }) {
    state.ignorePaths = state.ignorePaths.filter((path) => path !== ignorePath)
  }
}
