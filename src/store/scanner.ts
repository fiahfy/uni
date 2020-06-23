import path from 'path'
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { settingsStore } from '~/store'
const Worker = require('~/workers/scanner.worker.ts')

const worker = new Worker()

const reversed: { [key: string]: boolean } = {
  name: false,
  value: true,
}

type Status =
  | 'ready'
  | 'running'
  | 'succeeded'
  | 'cancelling'
  | 'cancelled'
  | 'failed'

@Module({
  name: 'scanner',
  stateFactory: true,
  namespaced: true,
})
export default class ScannerModule extends VuexModule {
  status: Status = 'ready'
  error?: Error = undefined
  rootPath = ''
  location = ''
  selectedNames: string[] = []
  hoveredNames: string[] = []
  progressFilePath = ''
  begunAt = 0
  endedAt = 0
  data: any = {}
  order = {
    by: 'value',
    descending: false,
  }

  colorTable: Function = () => {}

  get totalTime() {
    if (!this.begunAt || !this.endedAt) {
      return 0
    }
    return this.endedAt - this.begunAt
  }

  get totalSize() {
    return this.data.value || 0
  }

  get rootPathHasNoTrailingSlash() {
    // Remove trailing seperator
    const rootPath = this.rootPath
    if (rootPath && rootPath.slice(-1) === path.sep) {
      return rootPath.slice(0, rootPath.length - 1)
    }
    return rootPath
  }

  get items() {
    const { by, descending } = this.order
    return []
    return [
      { system: true, name: '<root>' },
      { system: true, name: '<parent>' },
      ...this.selectedNames
        .reduce((carry, name) => {
          if (!carry) {
            return carry
          }
          return carry.children.find((c: any) => c.name === name)
        }, this.data)
        .children.concat()
        .sort((a: any, b: any) => {
          let result = 0
          if (a[by] > b[by]) {
            result = 1
          } else if (a[by] < b[by]) {
            result = -1
          }
          if (result === 0) {
            if (a.path > b.path) {
              result = 1
            } else if (a.path < b.path) {
              result = -1
            }
          }
          result = reversed[by] ? -1 * result : result
          return descending ? -1 * result : result
        }),
    ]
  }

  get getScanTime() {
    return () => {
      return this.status === 'running' ? this.getElapsedTime() : this.totalTime
    }
  }

  get getElapsedTime() {
    return () => {
      return this.begunAt ? new Date().getTime() - this.begunAt : 0
    }
  }

  get getPaths() {
    return (item: any) => {
      let paths = [this.rootPathHasNoTrailingSlash]
      if (item.system) {
        if (item.name === '<parent>') {
          paths = [...paths, ...this.selectedNames]
        }
      } else {
        paths = [...paths, ...this.selectedNames, item.name]
      }
      return paths
    }
  }

  @Action
  initialize() {
    if (['running', 'cancelling'].includes(this.status)) {
      this.setStatus({ status: 'ready' })
    }
  }

  @Mutation
  setRootPath({ rootPath }: { rootPath: string }) {
    this.rootPath = rootPath
  }

  @Mutation
  setLocation({ location }: { location: string }) {
    this.location = location
  }

  @Mutation
  setProgressFilePath({ progressFilePath }: { progressFilePath: string }) {
    this.progressFilePath = progressFilePath
  }

  @Mutation
  setStatus({ status }: { status: Status }) {
    this.status = status
  }

  @Mutation
  setBegunAt({ begunAt }: { begunAt: number }) {
    this.begunAt = begunAt
  }

  @Mutation
  setEndedAt({ endedAt }: { endedAt: number }) {
    this.endedAt = endedAt
  }

  @Mutation
  setData({ data }: { data: Object }) {
    this.data = data
  }

  @Mutation
  setError({ error }: { error: Error }) {
    this.error = error
  }

  @Mutation
  setHoveredNames({ hoveredNames }: { hoveredNames: string[] }) {
    this.hoveredNames = hoveredNames
  }

  @Mutation
  setSelectedNames({ selectedNames }: { selectedNames: string[] }) {
    this.selectedNames = selectedNames
  }

  @Mutation
  setColorTable({ colorTable }: { colorTable: Function }) {
    this.colorTable = colorTable
  }

  @Action
  start() {
    if (['running', 'cancelling'].includes(this.status)) {
      return
    }

    this.setRootPath({ rootPath: this.location })
    this.setStatus({ status: 'running' })
    this.setBegunAt({ begunAt: Date.now() })

    worker.onmessage = ({
      data: { id, data },
    }: {
      data: { id: string; data: any }
    }) => {
      switch (id) {
        case 'progress':
          this.setProgressFilePath({ progressFilePath: data })
          break
        case 'refresh': {
          this.setData({ data })
          break
        }
        case 'complete': {
          this.setEndedAt({ endedAt: Date.now() })
          const newStatus =
            this.status === 'cancelling' ? 'cancelled' : 'succeeded'
          // const title =
          //   this.status === 'CANCELLING' ? 'Scan cancelled' : 'Scan finished'

          this.setStatus({ status: newStatus })
          this.setData({ data })
          // const sec = (this.getScanTime() / 1000).toFixed(2)
          // dispatch(
          //   'showNotification',
          //   { title, body: `Total time: ${sec} sec` },
          //   { root: true }
          // )
          break
        }
        case 'error':
          this.setEndedAt({ endedAt: Date.now() })
          this.setStatus({ status: 'failed' })
          this.setError({ error: new Error(data) })
          break
      }
    }
    const data = {
      dirPath: this.rootPath,
      refreshInterval: settingsStore.refreshInterval,
      ignoredPaths: settingsStore.ignoredPaths,
    }
    worker.postMessage({ id: 'start', data })
  }

  @Action
  cancel() {
    this.setStatus({ status: 'cancelling' })
    worker.postMessage({ id: 'cancel' })
  }

  @Action
  changeOrderBy({ orderBy }: { orderBy: any }) {
    // const descending =
    //   state.order.by === orderBy ? !state.order.descending : false
    // const order = { by: orderBy, descending }
    // commit('setOrder', { order })
  }
}
