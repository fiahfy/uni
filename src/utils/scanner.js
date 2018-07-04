import fs from 'fs'
import path from 'path'

const interval = 100

let scanning = false
let lastProgressTime = 0
let callbacks = {}
let node = {}

const scanFile = (filepath, node) => {
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
        scanFile(path.join(filepath, filename), childNode)
        node.value += childNode.value
      })
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

const calc = (node) => {
  if (!node.children) {
    return { ...node }
  }
  node.children = [...node.children].filter((child) => !!child.name).map((child) => {
    if (child.value) {
      return { ...child }
    }
    return calc(child)
  })
  node.value = node.children.reduce((carry, child) => carry + child.value, 0)
  return { ...node }
}

const reduce = (depth, limit, node) => {
  if (!node.children) {
    return node
  }
  if (depth > 10) {
    delete node.children
    return node
  }
  node.children = [...node.children].filter((child) => child.value > limit).map((child) => reduce(depth + 1, limit, child))
  return node
}

export const scan = (filepath) => {
  if (scanning) {
    return
  }
  scanning = true

  node = {}
  lastProgressTime = 0
  scanFile(filepath, node)

  send('complete')
  scanning = false
}

export const on = (event, callback) => {
  callbacks[event] = callback
}

export const getNode = () => {
  console.log(node)
  console.log({ ...node })
  const root = calc({ ...node })
  console.log(root)
  const limit = root.value * 0.001
  const result = reduce(0, limit, root)
  console.log(result)
  return result
}
