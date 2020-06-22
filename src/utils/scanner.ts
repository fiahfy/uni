import fs from 'fs'
import path from 'path'
const clone = require('@fiahfy/simple-clone').default

const INTERVAL = 100

type Node = {
  name: string
  value: number
  children: Node[]
}

let scanning = false
let cancelling = false
let lastProgressTime = 0
const callbacks: { [event: string]: Function } = {}
let ignoredPaths: string[] = []
let node = { name: '', value: 0, children: [] }

const delay = (millis = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, millis)
  })
}

const send = (event: string, args?: any) => {
  const callback = callbacks[event]
  if (callback) {
    callback(args)
  }
}

const scanFile = async (filePath: string, depth: number, node: Node) => {
  if (ignoredPaths.includes(filePath)) {
    return
  }
  if (cancelling) {
    return
  }

  const now = new Date().getTime()
  if (now - lastProgressTime > INTERVAL) {
    await delay() // wait for receiving cancel request
    lastProgressTime = now
    send('progress', filePath)
  }

  try {
    const stats = fs.lstatSync(filePath)
    if (stats.isDirectory()) {
      node.name = path.basename(filePath)
      node.value = 0
      node.children = []
      const filenames = fs.readdirSync(filePath)
      for (const filename of filenames) {
        const childNode = { name: '', value: 0, children: [] }
        node.children = [...node.children, childNode]
        await scanFile(path.join(filePath, filename), depth + 1, childNode)
        node.value += childNode.value
      }
      if (depth > 10) {
        delete node.children
      }
    } else {
      node.name = path.basename(filePath)
      node.value = stats.size
    }
  } catch (e) {
    //
  }
}

const sum = (node: Node) => {
  if (!node.children || !node.children.length) {
    return
  }
  node.children.forEach((child) => sum(child))
  node.value = node.children.reduce(
    (carry, child) => carry + (child.value || 0),
    0
  )
}

const reduce = (limit: number, node: Node) => {
  if (!node.children) {
    return
  }
  node.children = node.children.filter((child) => child.value > limit)
  node.children.forEach((child) => reduce(limit, child))
}

const scan = async (filePath: string) => {
  if (scanning) {
    return
  }
  cancelling = false
  scanning = true

  node = { name: '', value: 0, children: [] }
  lastProgressTime = 0
  await scanFile(filePath, 0, node)

  send('complete')
  scanning = false
}

const cancel = () => {
  cancelling = true
}

const on = (event: string, callback: Function) => {
  callbacks[event] = callback
}

const setConfig = (config: { ignoredPaths: string[] }) => {
  ignoredPaths = config.ignoredPaths
}

const getCalculatedNode = () => {
  const root = clone(node)
  sum(root)
  const limit = root.value * 0.001
  reduce(limit, root)
  return root
}

export default { scan, cancel, on, setConfig, getCalculatedNode }
