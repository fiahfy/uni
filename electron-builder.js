module.exports = {
  appId: 'net.fiahfy.electron-disk-analyzer',
  files: ['app', 'main.js'],
  mac: {
    target: ['dmg']
  },
  win: {
    target: ['nsis']
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  },
  publish: {
    provider: 'github'
  }
}
