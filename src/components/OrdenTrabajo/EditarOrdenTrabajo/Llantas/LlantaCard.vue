<template>
  <div class="border rounded-3 p-3 h-100">
    <strong>{{ llanta.detalle }}</strong> - Cantidad: {{ llanta.cantidad }} - Precio: {{ Number((llanta.cantidad * llanta.precioUnitario) - (llanta.tipoPromocion ? llanta.valorPromocion * llanta.cantidad * llanta.precioUnitario / 100 : llanta.valorPromocion)).toLocaleString("es-MX", {style: 'currency', currency: 'MXN'}) }}
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
