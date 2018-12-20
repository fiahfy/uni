import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

const FILENAME = 'data.json.gz'

const getFilepath = () => {
  const { remote } = require('electron')
  const dataFilepath = path.join(remote.app.getPath('userData'), FILENAME)
  return dataFilepath
}

const read = (filepath) => {
  try {
    const buffer = fs.readFileSync(filepath)
    const json = zlib.gunzipSync(buffer)
    const data = JSON.parse(json)
    return data
  } catch (e) {
    return null
  }
}

const write = (filepath, data) => {
  try {
    const json = JSON.stringify(data)
    const buffer = zlib.gzipSync(json)
    fs.writeFileSync(filepath, buffer)
  } catch (e) {
    //
  }
}

const unlink = (filepath) => {
  try {
    fs.unlinkSync(filepath)
  } catch (e) {
    //
  }
}

export default { getFilepath, read, write, unlink }
