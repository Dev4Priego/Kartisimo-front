<template>
	<div class="card mb-4 shadow-sm rounded-4">
		<div class="card-header bg-light">
			<strong>📦 Paquetes</strong>
		</div>

		<div class="card-body">
			<div v-if="paquetes.length === 0" class="text-muted">
				No hay paquetes asignados
			</div>

			<div v-for="paquete in paquetes" :key="paquete.idPaquete" class="mb-4">
				<h6 class="mb-2">{{ paquete.nombre }}</h6>

				<div class="ps-3">
					<TareaItem
						v-for="tarea in paquete.tareas"
						:key="tarea.id"
						:tarea="tarea"
						@toggle="toggleTarea(tarea)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import TareaItem from '../TareaItem.vue'

const props = defineProps({
  paquetes: { type: Array, required: true }
})

const emit = defineEmits(['tareaActualizada'])

const toggleTarea = (tarea) => {
  tarea.completada = !tarea.completada
  emit('tareaActualizada')
}
</script>
