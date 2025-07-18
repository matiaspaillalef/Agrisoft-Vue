import './assets/main.css'
import './assets/styles/login.css'
import './assets/styles/dx.generic.agrisoft-scheme.css' // Custom theme for DevExtreme
import './style.css'


import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import darkMode from './plugins/darkMode'

createApp(App).use(router).use(darkMode).mount('#app')
