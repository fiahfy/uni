import fs from 'fs'
import path from 'path'

let time = 0
export let node = {}
let current = {}
let interval = 3000
let callbacks = {}
let canceled = false
let scanning = false

export function scan (filepath) {
  if (scanning) {
    return
  }
  canceled = false
  time = (new Date()).getTime()
  node = current = {}
  setTimeout(() => {
    scanFile(filepath)
    scanning = false
    send('complete')
  })
}

export function cancel () {
  canceled = true
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

function scanFile (filepath) {
  if (canceled) {
    return
  }
  const now = (new Date()).getTime()
  if (now - time > interval) {
    send('progress')
    time = now
  }

  const stats = fs.lstatSync(filepath)
  if (stats.isFile()) {
    current.name = path.basename(filepath)
    current.size = stats.size
    return
  }
  if (stats.isDirectory()) {
    current.name = path.basename(filepath)
    current.children = []
    fs.readdirSync(filepath).forEach((filename) => {
      const tmp = current
      current = {}
      tmp.children.push(current)
      scanFile(path.join(filepath, filename))
      current = tmp
    })
  }
}
