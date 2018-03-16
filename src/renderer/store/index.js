import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { remote } from 'electron'
import router from '../router'
import explorer from './explorer'
import settings from './settings'
import Worker from '../workers/scanner.worker.js'
import fs from 'fs'
import path from 'path'

Vue.use(Vuex)

let worker

export const Status = {
  notYet: 'NOT_YET',
  progress: 'PROGRESS',
  done: 'DONE'
}

export default new Vuex.Store({
  state: {
    message: '',
    status: Status.notYet,
    root: '',
    scannedAt: new Date(),
    currentFilepath: '',
    start: null,
    end: null
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
      commit('setRoot', { root: dirpath })
      commit('start')

      if (worker) {
        worker.terminate()
      }
      worker = new Worker()
      worker.onmessage = ({ data: { id, data } }) => {
        switch (id) {
          case 'progress':
            commit('setCurrentFilepath', { currentFilepath: data })
            break
          case 'refresh':
            commit('updateScannedAt')
            break
          case 'complete':
            commit('end')
            commit('setStatus', { status: Status.done })
            commit('updateScannedAt')
            break
        }
      }
      worker.postMessage({ id: 'requestScan', data: dirpath })
    },
    cancel ({ commit }) {
      commit('setStatus', { status: Status.done })
      if (worker) {
        worker.terminate()
      }
    }
  },
  mutations: {
    setMessage (state, { message }) {
      state.message = message
    },
    setStatus (state, { status }) {
      state.status = status
    },
    setRoot (state, { root }) {
      state.root = root
    },
    updateScannedAt (state) {
      state.scannedAt = new Date()
    },
    setCurrentFilepath (state, { currentFilepath }) {
      state.currentFilepath = currentFilepath
    },
    start (state) {
      state.start = new Date()
    },
    end (state) {
      state.end = new Date()
    }
  },
  getters: {
    titleBar (state) {
      return process.platform === 'darwin'
    },
    getNode: () => () => {
      try {
        console.time('read file')
        const json = fs.readFileSync(path.join(process.cwd(), 'data.json'))
        console.timeEnd('read file')
        console.time('parse')
        const data = JSON.parse(json)
        console.timeEnd('parse')
        return data
      } catch (e) {
        return null
      }
    },
    getElapsedTime: (state) => () => {
      if (!state.start) {
        return null
      }
      return (new Date()).getTime() - state.start.getTime()
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
