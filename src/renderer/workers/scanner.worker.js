import { listFiles } from '../utils/file'

self.addEventListener('message', ({ data }) => {
  console.log('Begin scan directory: %s', data)
  console.log(new Date())
  const files = listFiles(data)
  console.log(new Date())
  self.postMessage(files)
})
