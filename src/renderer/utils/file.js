import fs from 'fs'
import path from 'path'

let time = 0

export function fetch (filepath, node, progress, interval) {
  const now = (new Date()).getTime()
  if (now - time > interval) {
    progress()
    time = now
  }
  const stats = fs.lstatSync(filepath)
  if (stats.isFile()) {
    node.name = path.basename(filepath)
    node.size = stats.size
    return
  }
  if (stats.isDirectory()) {
    node.name = path.basename(filepath)
    node.children = []
    fs.readdirSync(filepath).forEach((filename) => {
      const childNode = {}
      node.children.push(childNode)
      fetch(path.join(filepath, filename), childNode, progress, interval)
    })
  }
}

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
      const stats = fs.lstatSync(path.join(dirpath, filename))
      const file = {
        name: filename
      }
      if (!stats.isDirectory()) {
        file.size = stats.size
      } else {
        file.children = listFiles(path.join(dirpath, filename))
        // file.size = file.children.reduce((carry, file) => {
        //   return carry + file.size
        // }, 0)
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
