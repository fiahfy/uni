import path from 'path'
import { clipboard, remote, shell } from 'electron'
import status from '~/consts/status'
import Worker from '~/workers/scanner.worker.js'

const worker = Worker()

const reversed = {
  name: false,
  value: true
}

export const state = () => ({
  status: status.NOT_YET,
  error: null,
  rootPath: null,
  selectedPaths: [],
  focusedPaths: [],
  progressFilepath: null,
  begunAt: null,
  endedAt: null,
  node: {},
  order: {
    by: 'value',
    descending: false
  },
  colorTable: () => {}
})

export const getters = {
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
  },
  totalSize(state) {
    return state.node.value || 0
  },
  rootPathHasNoTrailingSlash(state) {
    // Remove trailing seperator
    const rootPath = state.rootPath
    if (rootPath && rootPath.slice(-1) === path.sep) {
      return rootPath.slice(0, rootPath.length - 1)
    }
    return rootPath
  },
  paths(state) {
    return [state.rootPath, ...state.selectedPaths, ...state.focusedPaths]
  },
  items(state) {
    const { by, descending } = state.order
    return state.selectedPaths
      .reduce((carry, name) => {
        if (!carry) {
          return carry
        }
        return carry.children.find((c) => c.name === name)
      }, state.node)
      .children.concat()
      .sort((a, b) => {
        let result = 0
        if (a[by] > b[by]) {
          result = 1
        } else if (a[by] < b[by]) {
          result = -1
        }
        if (result === 0) {
          if (a.path > b.path) {
            result = 1
          } else if (a.path < b.path) {
            result = -1
          }
        }
        result = reversed[by] ? -1 * result : result
        return descending ? -1 * result : result
      })
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
    const dirPath = filepaths[0]
    dispatch('scan', { dirPath })
  },
  scan({ commit, dispatch, getters, rootState, state }, { dirPath }) {
    if ([status.PROGRESS, status.CANCELLING].includes(state.status)) {
      return
    }

    commit('setRootPath', { rootPath: dirPath })
    commit('setStatus', { status: status.PROGRESS })
    commit('begin')

    worker.onmessage = ({ data: { id, data } }) => {
      switch (id) {
        case 'progress':
          commit('setProgressFilepath', { progressFilepath: data })
          break
        case 'refresh': {
          commit('setNode', { node: data })
          break
        }
        case 'complete': {
          commit('end')
          const newStatus =
            state.status === status.CANCELLING ? status.CANCELLED : status.DONE
          const title =
            state.status === status.CANCELLING
              ? 'Scan cancelled'
              : 'Scan finished'

          commit('setStatus', { status: newStatus })
          commit('setNode', { node: data })
          const sec = (getters.getScanTime() / 1000).toFixed(2)
          dispatch(
            'showNotification',
            { title, body: `Total time: ${sec} sec` },
            { root: true }
          )
          break
        }
        case 'error':
          commit('end')
          commit('setStatus', { status: status.ERROR })
          commit('setError', { error: new Error(data) })
          break
      }
    }
    const data = {
      dirPath: state.rootPath,
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
  },
  changeOrderBy({ commit, state }, { orderBy }) {
    const descending =
      state.order.by === orderBy ? !state.order.descending : false
    const order = { by: orderBy, descending }
    commit('setOrder', { order })
  }
}

export const mutations = {
  setStatus(state, { status }) {
    state.status = status
  },
  setError(state, { error }) {
    state.error = error
  },
  setRootPath(state, { rootPath }) {
    state.rootPath = rootPath
  },
  setSelectedPaths(state, { selectedPaths }) {
    state.selectedPaths = selectedPaths
  },
  setFocusedPaths(state, { focusedPaths }) {
    state.focusedPaths = focusedPaths
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
  setNode(state, { node }) {
    state.node = node
  },
  setOrder(state, { order }) {
    state.order = order
  },
  setColorTable(state, { colorTable }) {
    state.colorTable = colorTable
  }
}
