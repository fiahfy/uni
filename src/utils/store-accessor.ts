import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import scanner from '~/store/scanner'
import settings from '~/store/settings'

/* eslint-disable import/no-mutable-exports */
let scannerStore: scanner
let settingsStore: settings
/* eslint-enable import/no-mutable-exports */

function initializeStores(store: Store<any>): void {
  scannerStore = getModule(scanner, store)
  settingsStore = getModule(settings, store)
}

export { initializeStores, scannerStore, settingsStore }
