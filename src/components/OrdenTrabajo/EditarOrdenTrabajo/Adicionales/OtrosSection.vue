<template>
	<div class="card mb-4 shadow-sm">
		<div class="card-header bg-light d-flex justify-content-between align-items-center">
			<div>
				<i class="bi bi-tools me-2"></i>Otros servicios
			</div>
			
		</div>

		<div class="card-body">
			<!-- Input nueva tarea -->

			<div v-if="adicionales.length === 0" class="text-muted">
				No hay otros servicios
			</div>
			<div v-for="tarea in adicionales"
				class="d-flex align-items-center w-100 py-2 border-bottom"
			>
				<span>{{ tarea.descripcion }}</span>
				<div class="flex-grow-1"></div>
				
				<span class="me-3">{{ Number(tarea.cantidad * tarea.precioUnitario).toLocaleString("es-MX", {style: 'currency', currency: 'MXN'}) }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, getCurrentInstance, watch } from 'vue'
import axios from 'axios';
import Swal from 'sweetalert2';

const adicionales = ref([])
const { proxy } = getCurrentInstance()
const props = defineProps({
	otId: { required: true },
	usuario: Number
})

const emit = defineEmits(['tareaActualizada'])

const mostrarInput = ref(false)
const nuevaTarea = ref('')
const precio = ref(0)

const cargarAdicionales =  async(ot) => {
    adicionales.value = [];
  try {
    const res = await fetch(
      proxy.$serverIP +
        "api/OrdenTrabajo/getAdicionalesPorOT?nuevas=0&idOT=" + ot
    );
    if (!res.ok) throw new Error("Error en la respuesta");
    const response = await res.json();
    adicionales.value = response.data;
  } catch (error) {
    console.error("Error al cargar los adicionales:", error);
  }
};

watch(
  () => props.otId,
  (newVal) => {
    if (newVal) {
      cargarAdicionales(newVal)
    }
  },
  { immediate: true }
);
</script>
