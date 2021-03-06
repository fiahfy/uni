import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({
  name: 'settings',
  stateFactory: true,
  namespaced: true,
})
export default class SettingsModule extends VuexModule {
  darkTheme = false
  refreshInterval = 5000
  ignoredPaths: string[] = []

  @Mutation
  setDarkTheme({ darkTheme }: { darkTheme: boolean }): void {
    this.darkTheme = darkTheme
  }

  @Mutation
  setRefreshInterval({ refreshInterval }: { refreshInterval: number }): void {
    this.refreshInterval = refreshInterval
  }

  @Mutation
  addIgnoredPaths({ ignoredPaths }: { ignoredPaths: string[] }): void {
    for (const ignoredPath of ignoredPaths) {
      if (!this.ignoredPaths.includes(ignoredPath)) {
        this.ignoredPaths = [...this.ignoredPaths, ignoredPath]
      }
    }
  }

  @Mutation
  removeIgnoredPath({ ignoredPath }: { ignoredPath: string }): void {
    this.ignoredPaths = this.ignoredPaths.filter((path) => path !== ignoredPath)
  }
}
