import { ipcRenderer } from 'electron'
import { Name } from '~/router'

export const addIpcRendererListeners = (store) => {
  ipcRenderer.on('openDirectory', () => {
    store.dispatch('chart/openDirectory')
  })
  ipcRenderer.on('enterFullScreen', () => {
    store.commit('setFullScreen', { fullScreen: true })
  })
  ipcRenderer.on('leaveFullScreen', () => {
    store.commit('setFullScreen', { fullScreen: false })
  })
  ipcRenderer.on('showChart', () => {
    store.dispatch('changeRoute', { name: Name.chart })
  })
  ipcRenderer.on('showSettings', () => {
    store.dispatch('changeRoute', { name: Name.settings })
  })
}
