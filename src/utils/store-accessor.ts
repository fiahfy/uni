import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import layout from '~/store/layout'
// import scanner from '~/store/scanner'
import settings from '~/store/settings'

/* eslint-disable import/no-mutable-exports */
let layoutStore: layout
// let scannerStore: scanner
let settingsStore: settings
/* eslint-enable import/no-mutable-exports */

function initializeStores(store: Store<any>): void {
  layoutStore = getModule(layout, store)
  // scannerStore = getModule(scanner, store)
  settingsStore = getModule(settings, store)
}

export { initializeStores, layoutStore, settingsStore }
