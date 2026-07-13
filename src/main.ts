import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { ThemeModeStore } from './stores/ThemeMode/ThemeModeStore'
import { usePlayerStore } from './stores/playerStore'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
ThemeModeStore(pinia).initFromStorage()
usePlayerStore(pinia).initFromStorage()
app.use(i18n)
app.use(router)
app.mount('#app')
