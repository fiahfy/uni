import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import Worker from '../workers/scanner.worker.js'

export const Status = {
  notYet: 'NOT_YET',
  progress: 'PROGRESS',
  done: 'DONE',
  canceled: 'CANCELED'
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
      commit('end')
      commit('setStatus', { status: Status.canceled })
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
      const pathes = state.root === '/' ? [''] : state.root.split(path.sep)
      if (pathes.length && pathes[pathes.length - 1] === '') {
        pathes.pop()
      }
      if (pathes.length && pathes[0] === '') {
        pathes[0] = '$root'
      }
      return pathes
    },
    getNode: () => () => {
      try {
        console.time('read file')
        const buffer = fs.readFileSync(path.join(process.cwd(), 'data.json.gz'))
        console.timeEnd('read file')
        console.time('decompress')
        const json = zlib.gunzipSync(buffer)
        console.timeEnd('decompress')
        console.time('parse')
        const data = JSON.parse(json)
        console.timeEnd('parse')
        return data
      } catch (e) {
        return null
      }
    },
    getScanTime: (state, getters) => () => {
      if (state.status === Status.progress) {
        return getters.getElapsedTime()
      }
      return getters.totalTime
    },
    getElapsedTime: (state) => () => {
      if (!state.start) {
        return null
      }
      return (new Date()).getTime() - state.start
    },
    totalTime (state) {
      if (!state.start || !state.end) {
        return null
      }
      return state.end - state.start
    }
  }
}
