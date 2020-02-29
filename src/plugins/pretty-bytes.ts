import Vue from 'vue'
import prettyBytes from 'pretty-bytes'

Vue.filter('prettyBytes', (bytes?: number): string => {
  return prettyBytes(bytes ?? 0)
})
