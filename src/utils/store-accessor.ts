import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import scanner from '~/store/scanner'
import settings from '~/store/settings'

let scannerStore: scanner
let settingsStore: settings

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initializeStores(store: Store<any>): void {
  scannerStore = getModule(scanner, store)
  settingsStore = getModule(settings, store)
}

export { initializeStores, scannerStore, settingsStore }
