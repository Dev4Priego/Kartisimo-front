<template>
  <div class="border rounded-3 p-3 h-100">
    <h6 class="mb-3">{{ llanta.posicion }}</h6>

    <TareaItem
      v-for="tarea in llanta.tareas"
      :key="tarea.id"
      :tarea="tarea"
      @toggle="toggleTarea(tarea)"
    />
  </div>
</template>

<script setup>
import TareaItem from '../TareaItem.vue'

const props = defineProps({
  llanta: { type: Object, required: true }
})

const emit = defineEmits(['tareaActualizada'])

const toggleTarea = (tarea) => {
  tarea.completada = !tarea.completada
  emit('tareaActualizada')
}
</script>
