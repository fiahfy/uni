import fs from 'fs'
import path from 'path'

export function getFile (filepath) {
  const stats = fs.lstatSync(filepath)
  const file = {
    name: path.basename(filepath),
    path: filepath,
    size: stats.size,
    isDirectory: stats.isDirectory(),
    files: []
  }
  if (!file.isDirectory) {
    return file
  }
  const files = listFiles(file.path)
  file.size = files.reduce((carry, file) => {
    return carry + file.size
  }, 0)
  file.files = files
  return file
}

export function listFiles (dirpath) {
  const filepathes = fs.readdirSync(dirpath)
  return filepathes.reduce((carry, filename) => {
    try {
      if (filename.match(/^\./)) {
        return carry
      }
      const file = getFile(path.join(dirpath, filename))
      return [...carry, file]
    } catch (e) {
      return carry
    }
  }, [])
}

function readdirAsync (direpath) {
  return new Promise((resolve, reject) => {
    fs.readdir(direpath, (err, files) => {
      if (err) {
        reject(err)
        return
      }
      resolve(files)
    })
  })
}

function lstatAsync (filepath) {
  return new Promise((resolve, reject) => {
    fs.lstat(filepath, (err, stats) => {
      if (err) {
        reject(err)
        return
      }
      resolve(stats)
    })
  })
}

async function getFileAsync (filepath) {
  const stats = await lstatAsync(filepath)
  const file = {
    name: path.basename(filepath),
    path: filepath,
    size: stats.size,
    isDirectory: stats.isDirectory(),
    files: []
  }
  if (!file.isDirectory) {
    return file
  }
  const files = await listFilesAsync(file.path)
  file.size = files.reduce((carry, file) => {
    return carry + file.size
  }, 0)
  file.files = files
  return file
}

export async function listFilesAsync (dirpath) {
  const filepathes = await readdirAsync(dirpath)
  const result = await filepathes.reduce(async (carry, filename) => {
    try {
      if (filename.match(/^\./)) {
        return carry
      }
      const file = await getFileAsync(path.join(dirpath, filename))
      return [...carry, file]
    } catch (e) {
      return carry
    }
  }, [])
  console.log(dirpath)
  console.log(result)
  return result
}

export function countFiles (dirpath, options = { recursive: false }) {
  const filepathes = fs.readdirSync(dirpath)
  return filepathes.reduce((carry, filename) => {
    try {
      if (filename.match(/^\./)) {
        return carry
      }
      const file = getFile(path.join(dirpath, filename))
      if (!options.recursive || !file.stats.isDirectory()) {
        return carry + 1
      }
      const count = countFiles(file.path, options)
      return carry + 1 + count
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
