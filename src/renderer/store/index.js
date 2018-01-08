import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import router from '../router'
import { listFiles, getReadableSize } from '../utils/file'
import explorer from './explorer'
import settings from './settings'
import path from 'path'
import objectPath from 'object-path'

Vue.use(Vuex)

const Status = {
  progress: 'PROGRESS',
  done: 'DONE'
}

export default new Vuex.Store({
  state: {
    status: Status.done,
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
    async open ({ commit, dispatch }, { filepath }) {
      console.log(filepath)

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
      commit('setRoot', { root: filepath })
      commit('setFiles', { files })
      dispatch('explorer/changeDirectory', { dirpath: filepath })
    }
  },
  mutations: {
    // setDirectory (state, { directory }) {
    //   state.directory = directory
    // },
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
      return process.platform === 'darwin' && !state.fullScreen
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
