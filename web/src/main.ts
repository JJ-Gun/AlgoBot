import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const userStore = useUserStore()

userStore.fetchUser().finally(() => {
  app.use(router)
  app.use(naive)
  app.mount('#app')
})