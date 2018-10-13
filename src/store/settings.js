export default {
  namespaced: true,
  state: {
    darkTheme: false,
    refreshInterval: 1000
  },
  mutations: {
    setDarkTheme(state, { darkTheme }) {
      state.darkTheme = darkTheme
    },
    setRefreshInterval(state, { refreshInterval }) {
      state.refreshInterval = refreshInterval
    }
  }
}
