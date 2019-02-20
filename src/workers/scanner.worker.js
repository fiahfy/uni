import fs from 'fs'
import scanner from '~/utils/scanner'
import storage from '~/utils/storage'

const increaseInterval = 0

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

onmessage = async ({ data: { id, data } }) => {
  switch (id) {
    case 'scan': {
      const { directory, dataFilepath, refreshInterval, ignorePathes } = data

      storage.unlink(dataFilepath)
      postMessage({ id: 'refresh' })

      if (!exists(directory)) {
        postMessage({ id: 'error', data: 'Directory not found' })
        return
      }

      let time = new Date().getTime()
      let times = 0
      scanner.on('progress', (filepath) => {
        postMessage({ id: 'progress', data: filepath })
        const now = new Date().getTime()
        if (now - time > Number(refreshInterval) + increaseInterval * times) {
          storage.write(dataFilepath, scanner.getNode())
          postMessage({ id: 'refresh' })
          time = new Date().getTime()
          times++
        }
      })
      scanner.on('complete', () => {
        storage.write(dataFilepath, scanner.getNode())
        postMessage({ id: 'complete' })
      })
      await scanner.scan(directory)
      break
    }
    case 'cancel':
      scanner.cancel()
      break
  }
}
