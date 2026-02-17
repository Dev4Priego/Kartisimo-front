<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
let inactivityTimer = null;

const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos

const logoutUser = () => {
	localStorage.removeItem('userSession'); // o el token
	router.push("/");
};


const startTimer = () => {
	inactivityTimer = setTimeout(() => {
		logoutUser();
	}, INACTIVITY_TIME);
};

const resetTimer = () => {
	clearTimeout(inactivityTimer);
	startTimer();
};

const events = [
	"mousemove",
	"mousedown",
	"keypress",
	"scroll",
	"touchstart",
];

onMounted(() => {
	startTimer();
	events.forEach(event =>
		window.addEventListener(event, resetTimer)
	);
});

onBeforeUnmount(() => {
	clearTimeout(inactivityTimer);
	events.forEach(event =>
		window.removeEventListener(event, resetTimer)
	);
});
</script>

<template>
  <div class="p-0 min-vh-100">
    <router-view />
  </div>
</template>

<style>
@media print {

  /* Quitar header fijo */
  header,
  .header-fixed {
    display: none !important;
  }

  /* Eliminar márgenes que compensaban el header */
  .contenido {
    margin-top: 0 !important;
  }

  /* Eliminar offcanvas y backdrops */
  .offcanvas,
  .offcanvas-backdrop {
    display: none !important;
  }

  /* Evitar problemas de layout */
  html, body, #app {
    height: auto !important;
    min-height: auto !important;
  }

  body {
    margin: 0;
    display: block !important;
  }

  @page {
    margin: 10mm;
  }
}

</style>
