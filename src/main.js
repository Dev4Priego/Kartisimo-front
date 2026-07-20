import "vue3-easy-data-table/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css"; // CSS de Bootstrap
import "bootstrap-icons/font/bootstrap-icons.css";
import * as bootstrap from "bootstrap"; // JS de Bootstrap si usas modales, tooltips, etc.

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { configureAuth } from "./services/auth";
import { installHttpAuth } from "./services/httpAuth";

const app = createApp(App);
window.bootstrap = bootstrap; // <- esto hace que sea accesible en todo el proyecto

//app.config.globalProperties.$serverIP = "http://kartisimo.homelinux.org/"; // Entorno Productivo
app.config.globalProperties.$serverIP = "http://localhost:5106/" // Entorno Dev
<<<<<<< HEAD
=======

configureAuth({ router });
installHttpAuth();
>>>>>>> 1fe0bd6d731df107f005556883fa71a2906d9e4d

app.use(router).mount("#app");
