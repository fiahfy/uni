import fs from 'fs'
import path from 'path'
import clone from '@fiahfy/simple-clone'

const INTERVAL = 100

let scanning = false
let cancelling = false
let lastProgressTime = 0
let callbacks = {}
let ignoredPaths = []
let node = {}

const delay = (millis = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, millis)
  })
}

const send = (event, args) => {
  const callback = callbacks[event]
  if (callback) {
    callback(args)
  }
}

const scanFile = async (filepath, depth, node) => {
  if (ignoredPaths.includes(filepath)) {
    return
  }
  if (cancelling) {
    return
  }

  const now = new Date().getTime()
  if (now - lastProgressTime > INTERVAL) {
    await delay() // wait for receiving cancel request
    lastProgressTime = now
    send('progress', filepath)
  }

  try {
    const stats = fs.lstatSync(filepath)
    if (stats.isDirectory()) {
      node.name = path.basename(filepath)
      node.value = 0
      node.children = []
      const filenames = fs.readdirSync(filepath)
      for (let filename of filenames) {
        const childNode = {}
        node.children = [...node.children, childNode]
        await scanFile(path.join(filepath, filename), depth + 1, childNode)
        node.value += childNode.value
      }
      if (depth > 10) {
        delete node.children
      }
    } else {
      node.name = path.basename(filepath)
      node.value = stats.size
    }
  } catch (e) {
    //
  }
}

const sum = (node) => {
  if (!node.children) {
    return
  }
  node.children.forEach((child) => sum(child))
  node.value = node.children.reduce(
    (carry, child) => carry + (child.value || 0),
    0
  )
}

const reduce = (limit, node) => {
  if (!node.children) {
    return
  }
  node.children = node.children.filter((child) => child.value > limit)
  node.children.forEach((child) => reduce(limit, child))
}

const scan = async (filepath) => {
  if (scanning) {
    return
  }
  cancelling = false
  scanning = true

  node = {}
  lastProgressTime = 0
  await scanFile(filepath, 0, node)

  send('complete')
  scanning = false
}

const cancel = () => {
  cancelling = true
}

const on = (event, callback) => {
  callbacks[event] = callback
}

const setConfig = (config) => {
  ignoredPaths = config.ignoredPaths || []
}

const getNode = () => {
  const root = clone(node)
  sum(root)
  const limit = root.value * 0.001
  reduce(limit, root)
  return root
}

export default { scan, cancel, on, setConfig, getNode }
