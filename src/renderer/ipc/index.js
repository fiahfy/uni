import { ipcRenderer } from 'electron'

export function setup (store) {
  ipcRenderer.on('open', (event, { filepath }) => {
    store.dispatch('open', { filepath })
  })
  ipcRenderer.on('showExplorer', () => {
    store.dispatch('changeRoute', { name: 'explorer' })
  })
  ipcRenderer.on('showSettings', () => {
    store.dispatch('changeRoute', { name: 'settings' })
  })
}
