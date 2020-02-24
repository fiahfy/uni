import fs from 'fs'
import scanner from '~/utils/scanner'

const increaseInterval = 0
const mininumRefreshInterval = 1000

const exists = (filePath: string) => {
  try {
    fs.accessSync(filePath)
    return true
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    }
    throw e
  }
}

const isDir = (filePath: string) => {
  return fs.lstatSync(filePath).isDirectory()
}

const wait = (millis: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, millis)
  })
}

const ctx: Worker = self as any

ctx.onmessage = async ({ data: { id, data } }) => {
  switch (id) {
    case 'start': {
      const { dirPath, refreshInterval, ignoredPaths } = data

      ctx.postMessage({ id: 'refresh', data: {} })

      if (!exists(dirPath)) {
        ctx.postMessage({ id: 'error', data: 'Directory not found' })
        return
      }
      if (!isDir(dirPath)) {
        ctx.postMessage({ id: 'error', data: 'Not directory' })
        return
      }

      let time = new Date().getTime()
      let times = 0
      scanner.on('progress', (filePath: string) => {
        ctx.postMessage({ id: 'progress', data: filePath })
        const now = new Date().getTime()
        const interval = Math.max(mininumRefreshInterval, refreshInterval)
        if (now - time > Number(interval) + increaseInterval * times) {
          ctx.postMessage({ id: 'refresh', data: scanner.getCalculatedNode() })
          time = new Date().getTime()
          times++
        }
      })
      scanner.on('complete', async () => {
        const now = new Date().getTime()
        if (now - time < mininumRefreshInterval) {
          await wait(mininumRefreshInterval)
        }
        ctx.postMessage({ id: 'complete', data: scanner.getCalculatedNode() })
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
