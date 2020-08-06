import path from 'path'
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { Node } from '~/models'
import { settingsStore } from '~/store'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Worker = require('~/workers/scanner.worker.ts').default

const worker = new Worker()

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
  message = ''
  location = ''
  rootPath = ''
  progressPath = ''
  startTime = 0
  endTime = 0
  data: Node | null = null

  get scanning(): boolean {
    return ['running', 'cancelling'].includes(this.status)
  }

  get totalTime(): number {
    if (!this.startTime || !this.endTime) {
      return 0
    }
    return this.endTime - this.startTime
  }

  get totalSize(): number {
    return this.data?.value ?? 0
  }

  get rootPathHasNoTrailingSlash(): string {
    // Remove trailing seperator
    const rootPath = this.rootPath
    if (rootPath && rootPath.slice(-1) === path.sep) {
      return rootPath.slice(0, rootPath.length - 1)
    }
    return rootPath
  }

  get getScanTime() {
    return (): number => {
      return this.scanning ? this.getElapsedTime() : this.totalTime
    }
  }

  get getElapsedTime() {
    return (): number => {
      return this.startTime ? new Date().getTime() - this.startTime : 0
    }
  }

  @Action
  initialize(): void {
    if (this.scanning) {
      this.setStatus({ status: 'ready' })
    }
  }

  @Action
  run(): void {
    if (this.scanning) {
      return
    }

    this.setStatus({ status: 'running' })
    this.setMessage({ message: '' })
    this.setStartTime({ startTime: Date.now() })
    this.setRootPath({ rootPath: this.location })

    worker.onmessage = ({
      data: { id, data },
    }: {
      data: { id: string; data: any } // eslint-disable-line @typescript-eslint/no-explicit-any
    }) => {
      switch (id) {
        case 'progress':
          this.setProgressPath({ progressPath: data })
          break
        case 'refresh': {
          this.setData({ data })
          break
        }
        case 'done': {
          this.setEndTime({ endTime: Date.now() })
          const status =
            this.status === 'cancelling' ? 'cancelled' : 'succeeded'
          const title =
            this.status === 'cancelling' ? 'Scan cancelled' : 'Scan completed'

          this.setStatus({ status })
          this.setData({ data })

          const totalTime = (this.getScanTime() / 1000).toFixed(2)
          // eslint-disable-next-line
          const _ = new Notification(title, {
            body: `Total time: ${totalTime} sec`,
          })
          break
        }
        case 'failed':
          this.setEndTime({ endTime: Date.now() })
          this.setStatus({ status: 'failed' })
          this.setMessage({ message: data })
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
  cancel(): void {
    this.setStatus({ status: 'cancelling' })
    worker.postMessage({ id: 'cancel' })
  }

  @Mutation
  setStatus({ status }: { status: Status }): void {
    this.status = status
  }

  @Mutation
  setMessage({ message }: { message: string }): void {
    this.message = message
  }

  @Mutation
  setLocation({ location }: { location: string }): void {
    this.location = location
  }

  @Mutation
  setRootPath({ rootPath }: { rootPath: string }): void {
    this.rootPath = rootPath
  }

  @Mutation
  setProgressPath({ progressPath }: { progressPath: string }): void {
    this.progressPath = progressPath
  }

  @Mutation
  setStartTime({ startTime }: { startTime: number }): void {
    this.startTime = startTime
  }

  @Mutation
  setEndTime({ endTime }: { endTime: number }): void {
    this.endTime = endTime
  }

  @Mutation
  setData({ data }: { data: Node | null }): void {
    this.data = data
  }
}
