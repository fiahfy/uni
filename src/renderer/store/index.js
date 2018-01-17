import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { remote } from 'electron'
import router from '../router'
import explorer from './explorer'
import settings from './settings'
import Worker from '../workers/scanner.worker.js'

Vue.use(Vuex)

let worker

export const Status = {
  notYet: 'NOT_YET',
  progress: 'PROGRESS',
  done: 'DONE'
}

export default new Vuex.Store({
  state: {
    status: Status.notYet,
    // directory: '',
    root: '',
    files: [],
    message: ''
  },
  actions: {
    showMessage ({ commit }, { message }) {
      commit('setMessage', { message })
      // wait dom updated
      setTimeout(() => {
        commit('setMessage', { message: '' })
      })
    },
    changeRoute (_, payload) {
      router.push(payload)
    },
    focus (_, { selector }) {
      // wait dom updated
      setTimeout(() => {
        const el = document.querySelector(selector)
        if (el) {
          el.focus()
        }
      })
    },
    select (_, { selector }) {
      // wait dom updated
      setTimeout(() => {
        const el = document.querySelector(selector)
        if (el) {
          el.select()
        }
      })
    },
    selectDirectory ({ dispatch }) {
      const filepathes = remote.dialog.showOpenDialog({ properties: ['openDirectory'] })
      if (!filepathes) {
        return
      }
      const filepath = filepathes[0]
      dispatch('scan', { dirpath: filepath })
    },
    async scan ({ commit, dispatch }, { dirpath }) {
      commit('setStatus', { status: Status.progress })

      if (worker) {
        worker.terminate()
      }
      console.log(new Date())
      worker = new Worker()
      worker.onmessage = ({ data }) => {
        console.log(new Date())
        const files = data
        commit('setStatus', { status: Status.done })
        commit('setRoot', { root: dirpath })
        commit('setFiles', { files })
        console.log(new Date())
        dispatch('explorer/changeDirectory', { dirpath })
        console.log(new Date())
        dispatch('showMessage', { message: 'Complete Directory Scan' })
        console.log(new Date())
      }
      worker.postMessage(dirpath)
    }
  },
  mutations: {
    // setDirectory (state, { directory }) {
    //   state.directory = directory
    // },
    setStatus (state, { status }) {
      state.status = status
    },
    setRoot (state, { root }) {
      state.root = root
    },
    setFiles (state, { files }) {
      state.files = files
    },
    setMessage (state, { message }) {
      state.message = message
    }
  },
  getters: {
    titleBar (state) {
      return process.platform === 'darwin'
    }
  },
  modules: {
    explorer,
    settings
  },
  plugins: [
    createPersistedState({
      paths: [
        'settings'
      ]
    })
  ]
})
