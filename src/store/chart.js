import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { remote, shell } from 'electron'
import Worker from '~/workers/scanner.worker.js'

export const Status = {
  notYet: 'NOT_YET',
  progress: 'PROGRESS',
  done: 'DONE',
  cancelled: 'CANCELLED',
  error: 'ERROR'
}

const dataFilename = 'data.json.gz'
const dataFilepath = path.join(remote.app.getPath('userData'), dataFilename)
console.log('data directory: %s', dataFilepath)

const worker = new Worker()

export default {
  namespaced: true,
  state: {
    status: Status.notYet,
    error: null,
    directory: null,
    directoryInput: null,
    progressFilepath: null,
    begunAt: null,
    endedAt: null,
    updatedAt: null
  },
  getters: {
    getNode: (state) => () => {
      if (state.status === Status.notYet) {
        return
      }
      try {
        console.time('read file')
        const buffer = fs.readFileSync(dataFilepath)
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
      if (!state.begunAt) {
        return null
      }
      return (new Date()).getTime() - state.begunAt
    },
    totalTime (state) {
      if (!state.begunAt || !state.endedAt) {
        return null
      }
      return state.endedAt - state.begunAt
    }
  },
  actions: {
    initialize ({ commit, state }) {
      if (state.status === Status.progress) {
        commit('setStatus', { status: Status.cancelled })
      }
    },
    openDirectory ({ commit }) {
      const filepathes = remote.dialog.showOpenDialog({ properties: ['openDirectory'] })
      if (!filepathes || !filepathes.length) {
        return
      }
      const filepath = filepathes[0]
      commit('setDirectoryInput', { directoryInput: filepath })
    },
    scan ({ commit, dispatch, state }) {
      if (!state.directoryInput) {
        dispatch('showMessage', { color: 'error', text: 'Select scan directory' }, { root: true })
        return
      }

      commit('setStatus', { status: Status.progress })
      commit('setDirectory', { directory: state.directoryInput })
      commit('begin')

      worker.onmessage = ({ data: { id, data } }) => {
        switch (id) {
          case 'progress':
            commit('setProgressFilepath', { progressFilepath: data })
            break
          case 'refresh':
            commit('update')
            break
          case 'complete':
            commit('update')
            commit('end')
            commit('setStatus', { status: Status.done })
            break
          case 'error':
            commit('update')
            commit('end')
            commit('setStatus', { status: Status.error })
            commit('setError', { error: new Error(data) })
            break
        }
      }
      const data = {
        directory: state.directory,
        dataFilepath
      }
      worker.postMessage({ id: 'scan', data })
    },
    cancel ({ commit }) {
      commit('end')
      commit('setStatus', { status: Status.cancelled })
      if (worker) {
        worker.terminate()
      }
    },
    browseDirectory ({ dispatch }, { filepath }) {
      const result = shell.openItem(filepath)
      if (!result) {
        dispatch('showMessage', { color: 'error', text: 'Invalid directory' }, { root: true })
      }
    }
  },
  mutations: {
    setStatus (state, { status }) {
      state.status = status
    },
    setError (state, { error }) {
      state.error = error
    },
    setDirectory (state, { directory }) {
      state.directory = directory
    },
    setDirectoryInput (state, { directoryInput }) {
      state.directoryInput = directoryInput
    },
    setProgressFilepath (state, { progressFilepath }) {
      state.progressFilepath = progressFilepath
    },
    begin (state) {
      state.begunAt = (new Date()).getTime()
    },
    end (state) {
      state.endedAt = (new Date()).getTime()
    },
    update (state) {
      state.updatedAt = (new Date()).getTime()
    }
  }
}
