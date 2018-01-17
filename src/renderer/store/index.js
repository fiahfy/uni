import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { remote, ipcRenderer } from 'electron'
import router from '../router'
import { listFiles, getReadableSize, listFilesAsync } from '../utils/file'
import explorer from './explorer'
import settings from './settings'
import path from 'path'
import Worker from '../workers/scanner.worker.js'

Vue.use(Vuex)

export const Status = {
  notYet: 'NOT_YET',
  progress: 'PROGRESS',
  done: 'DONE'
}

function wait () {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 10000)
  })
}
function list (filepath) {
  return new Promise(resolve => {
    const files = listFiles(filepath)
    resolve(files)
  })
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
      dispatch('scan', { filepath })
    },
    async scan ({ commit, dispatch }, { filepath }) {
      commit('setStatus', { status: Status.progress })

      const worker = new Worker()
      worker.onmessage = ({ data }) => {
        commit('setStatus', { status: Status.done })
        commit('setRoot', { root: filepath })
        commit('setFiles', { files: data })
        dispatch('explorer/changeDirectory', { dirpath: filepath })
        dispatch('showMessage', { message: 'Complete Directory Scan' })
      }
      worker.postMessage(filepath)
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
