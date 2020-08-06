import fs from 'fs'
import { scanner } from '~/utils/scanner'

const minRefreshInterval = 1000

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

const ctx: Worker = self as any // eslint-disable-line @typescript-eslint/no-explicit-any

ctx.onmessage = async ({ data: { id, data } }) => {
  switch (id) {
    case 'start': {
      const { dirPath, refreshInterval, ignoredPaths } = data

      ctx.postMessage({ id: 'refresh', data: null })

      if (!exists(dirPath)) {
        return ctx.postMessage({ id: 'failed', data: 'Directory not found' })
      }

      if (!isDir(dirPath)) {
        return ctx.postMessage({ id: 'failed', data: 'Not directory' })
      }

      const interval = Math.max(minRefreshInterval, Number(refreshInterval))
      let refreshTime = Date.now() + interval
      scanner.on('progress', (filePath?: string) => {
        ctx.postMessage({ id: 'progress', data: filePath })
        const now = Date.now()
        if (now > refreshTime) {
          refreshTime = now + interval
          ctx.postMessage({ id: 'refresh', data: scanner.getCalculatedNode() })
        }
      })
      scanner.on('done', () => {
        ctx.postMessage({ id: 'done', data: scanner.getCalculatedNode() })
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
