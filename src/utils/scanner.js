import fs from 'fs'
import path from 'path'

const interval = 100

let scanning = false
let lastProgressTime = 0
let callbacks = {}
let node = {}

const scanFile = (filepath, depth, node) => {
  const now = (new Date()).getTime()
  if (now - lastProgressTime > interval) {
    lastProgressTime = now
    send('progress', filepath)
  }

  try {
    const stats = fs.lstatSync(filepath)
    if (stats.isDirectory()) {
      node.name = path.basename(filepath)
      node.value = 0
      node.children = []
      fs.readdirSync(filepath).forEach((filename) => {
        const childNode = {}
        node.children = [...node.children, childNode]
        scanFile(path.join(filepath, filename), depth + 1, childNode)
        node.value += childNode.value
      })
      if (depth > 10) {
        delete node.children
      }
    } else {
      node.name = path.basename(filepath)
      node.value = stats.size
    }
  } catch (e) {
    console.error(e)
  }
}

const send = (event, args) => {
  const callback = callbacks[event]
  if (callback) {
    callback(args)
  }
}

const sum = (node) => {
  if (!node.children) {
    return
  }
  node.children.forEach((child) => sum(child))
  node.value = node.children.reduce((carry, child) => carry + (child.value || 0), 0)
}

const reduce = (limit, node) => {
  if (!node.children) {
    return
  }
  node.children = node.children.filter((child) => child.value > limit)
  node.children.forEach((child) => reduce(limit, child))
}

export const scan = (filepath) => {
  if (scanning) {
    return
  }
  scanning = true

  node = {}
  lastProgressTime = 0
  scanFile(filepath, 0, node)

  send('complete')
  scanning = false
}

export const on = (event, callback) => {
  callbacks[event] = callback
}

export const getNode = () => {
  console.log('deepcopy: %o', new Date())
  const root = new Notification('', {data: node, silent: true}).data
  console.log('sum: %o', new Date())
  sum(root)
  console.log('reduce: %o', new Date())
  const limit = root.value * 0.001
  reduce(limit, root)
  return root
}
