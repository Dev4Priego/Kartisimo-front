import 'bootstrap/dist/css/bootstrap.min.css' // CSS de Bootstrap
import * as bootstrap from 'bootstrap' // JS de Bootstrap si usas modales, tooltips, etc.
import 'vue3-easy-data-table/dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
window.bootstrap = bootstrap // <- esto hace que sea accesible en todo el proyecto 

// app.config.globalProperties.$serverIP = "http://192.168.1.200/" // Entorno Productivo
app.config.globalProperties.$serverIP = "http://localhost:5106/" // Entorno Dev

app.use(router).mount('#app')
