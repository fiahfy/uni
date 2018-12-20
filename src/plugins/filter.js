import Vue from 'vue'
import electronAcceleratorFormatter from '@fiahfy/electron-accelerator-formatter'

Vue.filter('accelerator', (title, accelerator) => {
  return `${title} (${electronAcceleratorFormatter(accelerator)})`
})

Vue.filter('readableSize', (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) {
    return '0 Byte'
  }
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
})
