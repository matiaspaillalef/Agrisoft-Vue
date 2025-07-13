import './assets/main.css'
import './assets/styles/login.css'
import './style.css'

import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import darkMode from './plugins/darkMode'

createApp(App).use(router).use(darkMode).mount('#app')
