import { ipcRenderer } from 'electron'

export default ({ store }) => {
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
    store.$router.push('/chart')
  })
  ipcRenderer.on('showSettings', () => {
    store.$router.push('/settings')
  })
}
