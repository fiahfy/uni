import fs from 'fs'
import path from 'path'
import * as scanner from '../utils/scanner'

const dataPath = path.join(process.cwd(), 'data.json')

const output = (data) => {
  console.time('stringify')
  const json = JSON.stringify(data)
  console.timeEnd('stringify')
  console.time('write')
  fs.writeFileSync(dataPath, json)
  console.timeEnd('write')
}

onmessage = ({ data: { id, data } }) => {
  console.log('Begin scan directory: %s', data)
  console.time('scan')
  let time = (new Date()).getTime()
  scanner.on('progress', (filepath) => {
    postMessage({ id: 'progress', data: filepath })
    const now = (new Date()).getTime()
    if (now - time > 3000) {
      console.log('refresh')
      output(scanner.node)
      postMessage({ id: 'refresh' })
      time = (new Date()).getTime()
    }
  })
  scanner.on('complete', () => {
    console.log('complete')
    output(scanner.node)
    postMessage({ id: 'complete' })
    console.timeEnd('scan')
  })
  scanner.scan(data)
}
