import fs from 'fs'
import zlib from 'zlib'
import * as scanner from '~/utils/scanner'

const refreshInterval = 3000
const increaseInterval = 1000

const write = (filepath, data) => {
  console.time('stringify')
  const json = JSON.stringify(data)
  console.timeEnd('stringify')
  console.time('compress')
  const buffer = zlib.gzipSync(json)
  console.timeEnd('compress')
  console.time('write')
  fs.writeFileSync(filepath, buffer)
  console.timeEnd('write')
}

const unlink = (filepath) => {
  try {
    fs.accessSync(filepath)
  } catch (e) {
    if (e.code === 'ENOENT') {
      return
    }
    throw e
  }
  console.time('unlink')
  fs.unlinkSync(filepath)
  console.timeEnd('unlink')
}

const exists = (filepath) => {
  try {
    fs.statSync(filepath)
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
    case 'scan':
      const { directory, dataFilepath } = data
      unlink(dataFilepath)
      postMessage({ id: 'refresh' })

      if (!exists(directory)) {
        postMessage({ id: 'error', data: 'Directory not found' })
        return
      }

      console.log('Begin scan directory: %s', directory)
      console.time('scan')
      let time = (new Date()).getTime()
      let times = 0
      scanner.on('progress', (filepath) => {
        postMessage({ id: 'progress', data: filepath })
        const now = (new Date()).getTime()
        if (now - time > refreshInterval + increaseInterval * times) {
          console.log('refresh')
          write(dataFilepath, scanner.node)
          postMessage({ id: 'refresh' })
          time = (new Date()).getTime()
          times++
        }
      })
      scanner.on('complete', () => {
        console.log('complete')
        write(dataFilepath, scanner.node)
        postMessage({ id: 'complete' })
        console.timeEnd('scan')
      })
      scanner.scan(directory)
      break
  }
}
