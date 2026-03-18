<template>
	<div class="card mb-4 shadow-sm">
		<div class="card-header bg-light d-flex justify-content-between align-items-center">
			<div>
				<i class="bi bi-tools me-2"></i>Adicionales
			</div>
			<button
				class="btn btn-sm btn-outline-primary"
				@click="mostrarInput = !mostrarInput"
				
			>
				+ Agregar
			</button>
		</div>

		<div class="card-body">
			<!-- Input nueva tarea -->
			<div v-if="mostrarInput" class="input-group mb-3">
				<input
					v-model="nuevaTarea"
					type="text"
					class="form-control"
					placeholder="Nombre de la tarea"
				/>
				<div class="align-items-center px-2 py-1">
					Precio:
				</div>
				<input
					v-model="precio"
					type="number"
					class="form-control"
					placeholder="Precio"
				/>
				<button class="btn btn-primary" @click="agregarTarea">
					Guardar
				</button>
			</div>

			<div v-if="adicionales.length === 0" class="text-muted">
				No hay tareas adicionales
			</div>
			<div v-for="tarea in adicionales"
				class="d-flex align-items-center w-100 py-2 border-bottom"
			>
				<input
					type="checkbox"
					class="form-check-input me-2"
					:checked="tarea.completada"
					@change="toggleTarea(tarea)"
				/>
				<span :class="{ 'text-decoration-line-through text-muted': tarea.completada }">
					{{ tarea.descripcion }}
				</span>
				<div class="flex-grow-1"></div>
				
				<span class="me-3">{{ Number(tarea.cantidad * tarea.precioUnitario).toLocaleString("es-MX", {style: 'currency', currency: 'MXN'}) }}</span>
				<button class="btn btn-sm btn-outline-danger" @click="eliminarTarea(tarea)">
					<i class="bi bi-trash"></i>
				</button>
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

const agregarTarea = async () => {
	if (!nuevaTarea.value.trim()) return

	const idOT = props.otId;
	console.log(idOT);
	const payload = {
		descripcion: nuevaTarea.value.trim(),
		cantidad: 1,
		precioUnitario: precio.value,
		subTotal: precio.value,
		idPromocion: null,
		isVuelo: false
	};
	console.log(payload);
	try {
		const response = await axios.post(
		proxy.$serverIP + 'api/OrdenTrabajo/crearAdicionalOT?IdOT=' + idOT,
		payload
		);
		cargarAdicionales(idOT);
	} catch (error) {
		console.error("Error al crear el adicional:", error);
	}
	nuevaTarea.value = ''
	precio.value = 0
	mostrarInput.value = false
	emit('tareaActualizada')
}

const toggleTarea = async (tarea) => {
	tarea.completada = !tarea.completada;
	const idOT = props.otId;
	console.log(tarea.completada);
	const payload = {
		idDetalleOTServicio: tarea.idDetalleOTServicio,
		completada: tarea.completada ? 1 : 0
	};
	try {
		const response = await axios.post(
		proxy.$serverIP + 'api/OrdenTrabajo/completarTareaOT',
		payload
		);
		cargarAdicionales(idOT);
	} catch (error) {
		console.error("Error al crear el adicional:", error);
	}
}

const eliminarTarea = async (tarea) => {
	const result = await Swal.fire({
    title: 'Eliminar adicional',
    text: '¿Desea eliminar la tarea adicional ""' + tarea.descripcion + '"? Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;
  const idOT = props.otId;
  const payload = {
		id: tarea.idDetalleOTServicio,
		usuario: props.usuario
	};
  try {
		const response = await axios.put(
		proxy.$serverIP + 'api/OrdenTrabajo/BorrarAdicionalOT',
		payload
		);
		cargarAdicionales(idOT);
	} catch (error) {
		console.error("Error al crear el adicional:", error);
	}
}

const cargarAdicionales =  async(ot) => {
    adicionales.value = [];
  try {
    const res = await fetch(
      proxy.$serverIP +
        "api/OrdenTrabajo/getAdicionalesPorOT?idOT=" + ot
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
