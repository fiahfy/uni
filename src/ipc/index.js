import { ipcRenderer, remote } from 'electron'

export function addIpcRendererListeners (store) {
  ipcRenderer.on('scanDirectory', () => {
    const filepathes = remote.dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (!filepathes) {
      return
    }
    const filepath = filepathes[0]
    store.dispatch('scanDirectory', { dirpath: filepath })
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
