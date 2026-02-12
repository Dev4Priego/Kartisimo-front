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
				<button class="btn btn-primary" @click="agregarTarea">
					Guardar
				</button>
			</div>

			<div v-if="adicionales.length === 0" class="text-muted">
				No hay tareas adicionales
			</div>

			<TareaItem
				v-for="tarea in adicionales"
				:key="tarea.id"
				:tarea="tarea"
				@toggle="toggleTarea(tarea)"
			>
				<template #actions>
					<button
						class="btn btn-sm btn-outline-danger"
						@click="eliminarTarea(tarea)"
					>
						🗑
					</button>
				</template>
			</TareaItem>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import TareaItem from '../TareaItem.vue'

const props = defineProps({
  	adicionales: { type: Array, required: true }
})

const emit = defineEmits(['tareaActualizada'])

const mostrarInput = ref(false)
const nuevaTarea = ref('')

const agregarTarea = () => {
	if (!nuevaTarea.value.trim()) return

	props.adicionales.push({
		id: Date.now(),
		nombre: nuevaTarea.value,
		completada: false
	})

	nuevaTarea.value = ''
	mostrarInput.value = false
	emit('tareaActualizada')
}

const toggleTarea = (tarea) => {
	tarea.completada = !tarea.completada
	emit('tareaActualizada')
}

const eliminarTarea = (tarea) => {
	const index = props.adicionales.indexOf(tarea)
	if (index > -1) {
		props.adicionales.splice(index, 1)
		emit('tareaActualizada')
	}
}
</script>
