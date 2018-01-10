import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { remote, ipcRenderer } from 'electron'
import router from '../router'
import { listFiles, getReadableSize } from '../utils/file'
import explorer from './explorer'
import settings from './settings'
import path from 'path'

Vue.use(Vuex)

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
        commit('setMessage', '')
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
      remote.dialog.showOpenDialog(
        { properties: ['openDirectory'] },
        (filepathes) => {
          if (!filepathes) {
            return
          }
          const filepath = filepathes[0]
          remote.ipcRenderer.send('scanDirectory', { filepath })
          // dispatch('open', { filepath })
        }
      )
    },
    async open ({ commit, dispatch }, { filepath }) {
      console.log(filepath)
      commit('setStatus', { status: Status.progress })

      var t = (new Date()).getTime()
      // const c = countFiles(filepath, { recursive: true })
      // console.log((new Date()).getTime() - t)
      // console.log(c)

      t = (new Date()).getTime()
      const files = listFiles(filepath)
      // console.log((new Date()).getTime() - t)
      // const dirs = filepath.split(path.sep)
      // console.log(dirs)
      // // let dir = filepath
      // // while (dir = path.dirname(dir)) {
      // //   console.log(dir)
      // // }
      // const obj = {}
      // objectPath.set(obj, dirs, files)
      console.log(files)
      commit('setStatus', { status: Status.done })
      commit('setRoot', { root: filepath })
      commit('setFiles', { files })
      dispatch('explorer/changeDirectory', { dirpath: filepath })
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
