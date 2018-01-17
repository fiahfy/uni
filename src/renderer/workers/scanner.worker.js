import { listFiles, getReadableSize, listFilesAsync } from '../utils/file'

self.addEventListener('message', (e) => {
  console.log('Message received from main script')
  console.log('Posting message back to main script')
  const files = listFiles(e.data)
  postMessage(files)
})
