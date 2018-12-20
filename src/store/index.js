import createPersistedState from 'vuex-persistedstate'
import Package from '~~/package.json'

export const state = () => ({
  title: Package.productName,
  message: null,
  fullScreen: false,
  dialog: false
})

export const getters = {
  titleBar(state) {
    return process.platform === 'darwin' && !state.fullScreen
  }
}

export const actions = {
  showMessage({ commit }, message) {
    commit('setMessage', { message })
  },
  showNotification(_, { title, body }) {
    new Notification(title, { body })
  }
}

export const mutations = {
  setTitle(state, { title }) {
    state.title = title
  },
  setMessage(state, { message }) {
    state.message = message
  },
  setFullScreen(state, { fullScreen }) {
    state.fullScreen = fullScreen
  },
  showDialog(state) {
    state.dialog = true
  },
  dismissDialog(state) {
    state.dialog = false
  }
}

export const plugins = [
  createPersistedState({
    paths: ['chart', 'settings']
  })
]
