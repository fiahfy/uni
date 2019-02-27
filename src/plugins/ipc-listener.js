import { ipcRenderer } from 'electron'

export default ({ store }) => {
  ipcRenderer.on('scan', () => {
    store.dispatch('local/selectDirectory')
  })
  ipcRenderer.on('enterFullScreen', () => {
    store.commit('setFullScreen', { fullScreen: true })
  })
  ipcRenderer.on('leaveFullScreen', () => {
    store.commit('setFullScreen', { fullScreen: false })
  })
  ipcRenderer.on('showSettings', () => {
    store.commit('showDialog')
  })
}
