import { fetch } from '../utils/file'

self.addEventListener('message', ({ data: { id, data } }) => {
  console.log('Begin scan directory: %s', data)
  console.time('fetch')
  const node = {}
  fetch(data, node, () => {
    self.postMessage({ id: 'sendFiles', data: node })
    console.log('Worker sent data')
  }, 5000)
  console.timeEnd('fetch')
  self.postMessage({ id: 'sendFiles', data: node })
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
