import fs from 'fs'
import * as scanner from '~/utils/scanner'
import * as Storage from '~/utils/storage'

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

onmessage = ({ data: { id, data } }) => {
  switch (id) {
    case 'scan': {
      const { directory, refreshInterval, dataFilepath } = data

      Storage.unlink(dataFilepath)
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
          Storage.write(dataFilepath, scanner.getNode())
          postMessage({ id: 'refresh' })
          time = new Date().getTime()
          times++
        }
      })
      scanner.on('complete', () => {
        Storage.write(dataFilepath, scanner.getNode())
        postMessage({ id: 'complete' })
      })
      scanner.scan(directory)
      break
    }
  }
}
