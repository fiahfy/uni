import { listFiles, countFiles } from '../utils/file'

self.addEventListener('message', ({ data: { id, data } }) => {
  console.log('Begin scan directory: %s', data)
  let i = 0
  console.log(++i, new Date())
  // const count = countFiles(data)
  // console.log(++i, new Date())
  // self.postMessage({ id: 'sendCount', data: count })
  // console.log(++i, new Date())
  const files = listFiles(data)
  console.log(++i, new Date())
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

  self.postMessage({ id: 'sendFiles', data: files })
  console.log(++i, new Date())
})
