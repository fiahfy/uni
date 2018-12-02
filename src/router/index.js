import Vue from 'vue'
import Router from 'vue-router'
import Chart from '~/pages/Chart'
import Settings from '~/pages/Settings'

Vue.use(Router)

export const Name = {
  chart: 'chart',
  settings: 'settings'
}

export default new Router({
  routes: [
    {
      path: '/',
      name: 'chart',
      component: Chart
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})
