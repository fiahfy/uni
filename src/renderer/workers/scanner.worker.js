import * as scanner from '../utils/scanner'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data.json')

self.addEventListener('message', ({ data: { id, data } }) => {
  console.log({ id, data })
  if (id === 'requestCancel') {
    console.log('cancel')
    scanner.cancel()
    return
  }
  console.log('Begin scan directory: %s', data)
  console.time('fetch')
  scanner.on('progress', () => {
    console.log('progress', scanner.current)
    fs.writeFileSync(dataPath, JSON.stringify(scanner.node))
    self.postMessage({ id: 'progress' })
  })
  scanner.on('complete', () => {
    console.timeEnd('fetch')
    console.log('complete')
    fs.writeFileSync(dataPath, JSON.stringify(scanner.node))
    self.postMessage({ id: 'complete' })
  })
  scanner.scan(data)

  // console.log(new Date())
  // const j = Uint8Array.from([files])
  // console.log(j)
  // console.log(j.values().next().value)
  // console.log(new Date())

  // let d = []
  // for (let i = 0; i < 100; i++) {
  //   for (let f of files) {
  //     d.push(Object.assign({}, f, {
  //       name: f.name + '-' + i
  //     }))
  //   }
  // }
  // console.log(d)
  // const json = JSON.stringify(d)
  // console.log(++i, new Date())
})
