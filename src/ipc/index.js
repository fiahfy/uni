import { ipcRenderer } from 'electron'

export function addIpcRendererListeners (store) {
  ipcRenderer.on('openDirectory', () => {
    store.dispatch('chart/openDirectory')
  })
  ipcRenderer.on('enterFullScreen', () => {
    store.commit('setFullScreen', { fullScreen: true })
  })
  ipcRenderer.on('leaveFullScreen', () => {
    store.commit('setFullScreen', { fullScreen: false })
  })
  ipcRenderer.on('showSettings', () => {
    store.dispatch('changeRoute', { name: 'settings' })
  })
}
