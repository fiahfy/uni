import fs from 'fs'
import path from 'path'
import Worker from '../workers/scanner.worker.js'

export const Status = {
  notYet: 'NOT_YET',
  progress: 'PROGRESS',
  done: 'DONE'
}

let worker

export default {
  namespaced: true,
  state: {
    status: Status.notYet,
    root: null,
    scannedAt: new Date(),
    currentFilepath: '',
    start: null,
    end: null
  },
  actions: {
    scan ({ commit, dispatch }, { dirpath }) {
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
      state.start = (new Date()).getTime()
    },
    end (state) {
      state.end = (new Date()).getTime()
    }
  },
  getters: {
    rootPathes (state) {
      if (!state.root) {
        return []
      }
      console.log(path.sep)
      return state.root.split(path.sep)
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
      return (new Date()).getTime() - state.start
    }
  }
}
