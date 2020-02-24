module.exports = {
  appId: 'net.fiahfy.electron-disk-analyzer',
  files: ['app', 'main.js'],
  mac: {
    publish: {
      provider: 'github'
    }
  },
  win: {
    publish: {
      provider: 'github'
    }
  },
  linux: {
    publish: {
      provider: 'github'
    }
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  }
}
