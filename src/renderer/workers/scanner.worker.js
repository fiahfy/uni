import { listFiles, countFiles } from '../utils/file'

self.addEventListener('message', ({ data: { id, data } }) => {
  console.log('Begin scan directory: %s', data)
  // console.log(new Date())
  // // const count = countFiles(data)
  // console.log(new Date())
  // self.postMessage({ id: 'sendCount', data: count })
  console.log(new Date())
  const files = listFiles(data)
  console.log(new Date())
  const j = Uint8Array.from([files])
  console.log(j)
  console.log(j.values().next().value)
  console.log(new Date())
  self.postMessage({ id: 'sendFiles', data: files })
})
