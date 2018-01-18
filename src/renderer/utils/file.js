import fs from 'fs'
import path from 'path'

export function getFile (filepath) {
  const stats = fs.lstatSync(filepath)
  return {
    name: path.basename(filepath),
    path: filepath,
    size: stats.size,
    isDirectory: stats.isDirectory()
  }
}

export function listFiles (dirpath) {
  const filepathes = fs.readdirSync(dirpath)
  return filepathes.reduce((carry, filename) => {
    try {
      if (filename.match(/^\./)) {
        return carry
      }
      const file = getFile(path.join(dirpath, filename))
      if (!file.isDirectory) {
        file.files = []
      } else {
        file.files = listFiles(file.path)
        file.size = file.files.reduce((carry, file) => {
          return carry + file.size
        }, 0)
      }
      return [...carry, file]
    } catch (e) {
      return carry
    }
  }, [])
}

export function countFiles (dirpath) {
  const filepathes = fs.readdirSync(dirpath)
  return filepathes.reduce((carry, filename) => {
    try {
      if (filename.match(/^\./)) {
        return carry
      }
      const file = getFile(path.join(dirpath, filename))
      if (!file.isDirectory) {
        return carry + 1
      } else {
        return carry + countFiles(file.path)
      }
    } catch (e) {
      return carry
    }
  }, 0)
}

export function getReadableSize (bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) {
    return '0 Byte'
  }
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}
