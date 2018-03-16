import * as scanner from '../utils/scanner'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data.json')

onmessage = ({ data: { id, data } }) => {
  console.log('Begin scan directory: %s', data)
  console.time('scan')
  let time = (new Date()).getTime()
  scanner.on('progress', (filepath) => {
    postMessage({ id: 'progress', data: filepath })
    const now = (new Date()).getTime()
    if (now - time > 3000) {
      console.time('refresh and output')
      fs.writeFileSync(dataPath, JSON.stringify(scanner.node))
      console.timeEnd('refresh and output')
      postMessage({ id: 'refresh' })
      time = (new Date()).getTime()
    }
  })
  scanner.on('complete', () => {
    console.timeEnd('scan')
    console.time('complete and output')
    fs.writeFileSync(dataPath, JSON.stringify(scanner.node))
    console.timeEnd('complete and output')
    postMessage({ id: 'complete' })
  })
  scanner.scan(data)
}
