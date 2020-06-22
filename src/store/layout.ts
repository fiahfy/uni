import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

@Module({
  name: 'layout',
  stateFactory: true,
  namespaced: true,
})
export default class LayoutModule extends VuexModule {
  fullScreen = false
  message = ''
  dialog = false

  @Mutation
  setFullScreen({ fullScreen }: { fullScreen: boolean }) {
    this.fullScreen = fullScreen
  }

  @Mutation
  setMessage({ message }: { message: string }) {
    this.message = message
  }

  @Mutation
  setDialog({ dialog }: { dialog: boolean }) {
    this.dialog = dialog
  }

  @Action
  showMessage({ message }: { message: string }) {
    this.setMessage({ message })
  }

  // @Action
  // showNotification(_, { title, body }) {
  //   new Notification(title, { body })
  // }
}
