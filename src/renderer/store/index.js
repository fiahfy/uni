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
    status: Status.notYet,
    // directory: '',
    root: '',
    files: [],
    message: '',
    scannedAt: new Date()
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
      worker.onmessage = ({ data: { id, data } }) => {
        switch (id) {
          case 'sendCount':
            console.log(data)
            break
          case 'sendFiles':
            let i = 10
            console.log(++i, new Date())
            console.log('recv')
            // console.log(data)
            console.log(++i, new Date())
            // setTimeout(() => {
            // console.log(++i, new Date())
            // const files = JSON.parse(data)
            let files = data
            // console.log(files)
            console.log(++i, new Date())
            commit('setStatus', { status: Status.done })
            commit('setRoot', { root: dirpath })
            console.log(++i, new Date())
            // commit('setFiles', { files })
            fs.writeFileSync(path.join(process.cwd(), 'data.json'), JSON.stringify(files))
            commit('updateScannedAt')
            console.log(++i, new Date())
            // dispatch('explorer/changeDirectory', { dirpath })
            console.log(++i, new Date())
            // dispatch('showMessage', { message: 'Complete Directory Scan' })
            console.log(++i, new Date())
            // }, 100)
            break
        }
      }
      worker.postMessage({ id: 'requestScan', data: dirpath })
    },
    cancel () {
      console.log('call cancel')
      worker.postMessage({ id: 'requestCancel' })
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
      console.log(new Date())
      state.files = Object.freeze(files)
      // state.files = files
      console.log(new Date())
    },
    setMessage (state, { message }) {
      state.message = message
    },
    updateScannedAt (state) {
      state.scannedAt = new Date()
    }
  },
  getters: {
    titleBar (state) {
      return process.platform === 'darwin'
    },
    getFiles: () => () => {
      try {
        return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data.json')))
      } catch (e) {
        return null
      }
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
