import fs from 'fs'
import path from 'path'

const interval = 100

export let node = {}

let scanning = false
let lastProgressTime = 0
let callbacks = {}

export function scan (filepath) {
  if (scanning) {
    return
  }
  scanning = true

  node = {}
  lastProgressTime = 0
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
  if (now - lastProgressTime > interval) {
    lastProgressTime = now
    send('progress', filepath)
  }

  const stats = fs.lstatSync(filepath)
  if (stats.isDirectory()) {
    node.name = path.basename(filepath)
    node.children = []
    fs.readdirSync(filepath).forEach((filename) => {
      const childNode = {}
      node.children.push(childNode)
      scanFile(path.join(filepath, filename), childNode)
    })
  } else {
    node.name = path.basename(filepath)
    node.size = stats.size
  }
}
