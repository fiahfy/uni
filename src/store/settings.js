export const state = () => ({
  darkTheme: false,
  refreshInterval: 5000
})

export const mutations = {
  setDarkTheme(state, { darkTheme }) {
    state.darkTheme = darkTheme
  },
  setRefreshInterval(state, { refreshInterval }) {
    state.refreshInterval = refreshInterval
  }
}
