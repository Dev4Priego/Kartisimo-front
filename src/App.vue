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
