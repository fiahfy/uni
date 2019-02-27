import { clipboard, remote, shell } from 'electron'
import status from '~/consts/status'
import storage from '~/utils/storage'
import Worker from '~/workers/scanner.worker.js'

const worker = Worker()

export const state = () => ({
  status: status.NOT_YET,
  error: null,
  directory: null,
  progressFilepath: null,
  begunAt: null,
  endedAt: null,
  updatedAt: null
})

export const getters = {
  getNode: (state) => () => {
    if (state.status === status.NOT_YET) {
      return
    }
    return storage.read(storage.getFilepath())
  },
  getScanTime: (state, getters) => () => {
    if (state.status === status.PROGRESS) {
      return getters.getElapsedTime()
    }
    return getters.totalTime
  },
  getElapsedTime: (state) => () => {
    if (!state.begunAt) {
      return null
    }
    return new Date().getTime() - state.begunAt
  },
  totalTime(state) {
    if (!state.begunAt || !state.endedAt) {
      return null
    }
    return state.endedAt - state.begunAt
  }
}

export const actions = {
  selectDirectory({ dispatch }) {
    const filepaths = remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!filepaths || !filepaths.length) {
      return
    }
    const directory = filepaths[0]
    dispatch('scan', { directory })
  },
  scan({ commit, dispatch, getters, rootState, state }, { directory }) {
    if ([status.PROGRESS, status.CANCELLING].includes(state.status)) {
      return
    }

    commit('setStatus', { status: status.PROGRESS })
    commit('setDirectory', { directory })
    commit('begin')

    worker.onmessage = ({ data: { id, data } }) => {
      switch (id) {
        case 'progress':
          commit('setProgressFilepath', { progressFilepath: data })
          break
        case 'refresh':
          commit('update')
          break
        case 'complete': {
          commit('update')
          commit('end')
          if (state.status === status.CANCELLING) {
            commit('setStatus', { status: status.CANCELLED })
            return
          }
          commit('setStatus', { status: status.DONE })
          const sec = (getters.getScanTime() / 1000).toFixed(2)
          dispatch(
            'showNotification',
            { title: 'Scan finished', body: `Total time: ${sec} sec` },
            { root: true }
          )
          break
        }
        case 'error':
          commit('update')
          commit('end')
          commit('setStatus', { status: status.ERROR })
          commit('setError', { error: new Error(data) })
          break
      }
    }
    const data = {
      directory: state.directory,
      dataFilepath: storage.getFilepath(),
      refreshInterval: rootState.settings.refreshInterval,
      ignoredPaths: rootState.settings.ignoredPaths
    }
    worker.postMessage({ id: 'scan', data })
  },
  cancel({ commit }) {
    commit('setStatus', { status: status.CANCELLING })
    worker.postMessage({ id: 'cancel' })
  },
  browseDirectory({ dispatch }, { filepath }) {
    const result = shell.openItem(filepath)
    if (!result) {
      dispatch(
        'showMessage',
        { color: 'error', text: 'Directory not found' },
        { root: true }
      )
    }
  },
  writeToClipboard(_, { filepath }) {
    clipboard.writeText(filepath)
  },
  selectIgnoredDirectory({ commit }) {
    const filepaths = remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!filepaths || !filepaths.length) {
      return
    }
    const ignoredPath = filepaths[0]
    commit('settings/addIgnoredPath', { ignoredPath }, { root: true })
  }
}

export const mutations = {
  setStatus(state, { status }) {
    state.status = status
  },
  setError(state, { error }) {
    state.error = error
  },
  setDirectory(state, { directory }) {
    state.directory = directory
  },
  setProgressFilepath(state, { progressFilepath }) {
    state.progressFilepath = progressFilepath
  },
  begin(state) {
    state.begunAt = new Date().getTime()
  },
  end(state) {
    state.endedAt = new Date().getTime()
  },
  update(state) {
    state.updatedAt = new Date().getTime()
  }
}
