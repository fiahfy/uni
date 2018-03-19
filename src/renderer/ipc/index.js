import { ipcRenderer, remote } from 'electron'

export function addRendererListeners (store) {
  ipcRenderer.on('open', () => {
    const filepathes = remote.dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (!filepathes) {
      return
    }
    const filepath = filepathes[0]
    store.dispatch('scan', { dirpath: filepath })
  })
  ipcRenderer.on('showExplorer', () => {
    store.dispatch('changeRoute', { name: 'explorer' })
  })
  ipcRenderer.on('showSettings', () => {
    store.dispatch('changeRoute', { name: 'settings' })
  })
}
