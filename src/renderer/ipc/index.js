import { ipcRenderer } from 'electron'

export function addRendererListeners (store) {
  ipcRenderer.on('open', (event, { filepath }) => {
    store.dispatch('scan', { dirpath: filepath })
  })
  ipcRenderer.on('showExplorer', () => {
    store.dispatch('changeRoute', { name: 'explorer' })
  })
  ipcRenderer.on('showSettings', () => {
    store.dispatch('changeRoute', { name: 'settings' })
  })
}
