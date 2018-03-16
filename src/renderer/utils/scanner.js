import fs from 'fs'
import path from 'path'

export let node = {}
export let current = null
let scanning = false
let time = 0
let interval = 3000
let callbacks = {}

export function scan (filepath) {
  if (scanning) {
    return
  }
  time = (new Date()).getTime()
  node = {}
  setTimeout(() => {
    scanFile(filepath, node)
    send('complete')
    scanning = false
  })
}

export function on (event, callback) {
  callbacks[event] = callback
}

function send (event, args) {
  const callback = callbacks[event]
  if (callback) {
    callback(args)
  }
}

function scanFile (filepath, node) {
  const now = (new Date()).getTime()
  if (now - time > interval) {
    current = filepath
    send('progress')
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
      scanFile(path.join(filepath, filename), childNode)
    })
  }
}
