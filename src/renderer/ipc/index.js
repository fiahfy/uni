import { ipcMain, ipcRenderer } from 'electron'
import { listFilesAsync } from '../utils/file'

export function setupIpcRenderer (store) {
  ipcRenderer.on('open', (event, { filepath }) => {
    store.dispatch('open', { filepath })
  })
  ipcRenderer.on('showExplorer', () => {
    store.dispatch('changeRoute', { name: 'explorer' })
  })
  ipcRenderer.on('showSettings', () => {
    store.dispatch('changeRoute', { name: 'settings' })
  })
  ipcRenderer.on('scanedDirectory', (event, { filepath, files }) => {
    store.commit('setStatus', { status: 'DONE' })
    store.commit('setRoot', { root: filepath })
    store.commit('setFiles', { files })
  })
  ipcRenderer.on('updateStatus', (event, { status }) => {
    store.commit('setStatus', { status })
  })
}

export function setupIpcMain () {
  ipcMain.on('scanDirectory', async (event, { filepath }) => {
    event.sender.send('updateStatus', { status: 'PROGRESS' })
    const files = await listFilesAsync(filepath)
    event.sender.send('scanedDirectory', { filepath, files })
  })
}
