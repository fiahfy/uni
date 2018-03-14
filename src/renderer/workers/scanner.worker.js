import * as scanner from '../utils/scanner'

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
    console.log('progress')
    self.postMessage({ id: 'sendFiles', data: scanner.node })
  })
  scanner.scan(data)
  console.timeEnd('fetch')
  console.log('complete')
  self.postMessage({ id: 'sendFiles', data: scanner.node })
  console.log('Worker sent data')
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
