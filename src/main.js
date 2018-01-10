import App from './main/app'
import { setupIpcMain } from './renderer/ipc'

setupIpcMain()

const app = new App()
app.load()
