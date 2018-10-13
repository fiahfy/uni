import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

const filename = 'data.json.gz'

export const getFilepath = () => {
  const { remote } = require('electron')
  const dataFilepath = path.join(remote.app.getPath('userData'), filename)
  return dataFilepath
}

export const read = (filepath) => {
  try {
    const buffer = fs.readFileSync(filepath)
    const json = zlib.gunzipSync(buffer)
    const data = JSON.parse(json)
    return data
  } catch (e) {
    return null
  }
}

export const write = (filepath, data) => {
  try {
    const json = JSON.stringify(data)
    const buffer = zlib.gzipSync(json)
    fs.writeFileSync(filepath, buffer)
  } catch (e) {
    //
  }
}

export const unlink = (filepath) => {
  try {
    fs.unlinkSync(filepath)
  } catch (e) {
    //
  }
}
