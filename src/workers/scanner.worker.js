import fs from 'fs'
import scanner from '~/utils/scanner'

const increaseInterval = 0
const mininumRefreshInterval = 1000

const exists = (filepath) => {
  try {
    fs.accessSync(filepath)
    return true
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    }
    throw e
  }
}

const isDir = (filepath) => {
  return fs.lstatSync(filepath).isDirectory()
}

const wait = (millis) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, millis)
  })
}

onmessage = async ({ data: { id, data } }) => {
  switch (id) {
    case 'scan': {
      const { dirPath, refreshInterval, ignoredPaths } = data

      postMessage({ id: 'refresh', data: {} })

      if (!exists(dirPath)) {
        postMessage({ id: 'error', data: 'Directory not found' })
        return
      }
      if (!isDir(dirPath)) {
        postMessage({ id: 'error', data: 'Not directory' })
        return
      }

      let time = new Date().getTime()
      let times = 0
      scanner.on('progress', (filepath) => {
        postMessage({ id: 'progress', data: filepath })
        const now = new Date().getTime()
        const interval = Math.max(mininumRefreshInterval, refreshInterval)
        if (now - time > Number(interval) + increaseInterval * times) {
          postMessage({ id: 'refresh', data: scanner.getCalculatedNode() })
          time = new Date().getTime()
          times++
        }
      })
      scanner.on('complete', async () => {
        const now = new Date().getTime()
        if (now - time < mininumRefreshInterval) {
          await wait(mininumRefreshInterval)
        }
        postMessage({ id: 'complete', data: scanner.getCalculatedNode() })
      })
      scanner.setConfig({ ignoredPaths })
      await scanner.scan(dirPath)
      break
    }
    case 'cancel':
      scanner.cancel()
      break
  }
}
