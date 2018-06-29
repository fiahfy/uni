import Vue from 'vue'
import Vuetify from 'vuetify'
import VueMoment from 'vue-moment'
import { buildText } from '~/utils/accelerator'

Vue.use(Vuetify, {
  theme: {
    primary: '#ff4081',
    accent: '#ff4081'
  }
})

Vue.use(VueMoment)

Vue.filter('accelerator', (title, accelerator) => {
  return `${title} (${buildText(accelerator)})`
})

Vue.filter('readableSize', (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) {
    return '0 Byte'
  }
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
})
