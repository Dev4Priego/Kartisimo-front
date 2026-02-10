<template>
  <div class="mb-4">
    <h6 class="mb-1">Progreso de la orden</h6>

    <div class="progress" style="height: 22px">
      <div
        class="progress-bar"
        role="progressbar"
        :style="{ width: porcentaje + '%' }"
      >
        {{ porcentaje }}%
      </div>
    </div>

    <small class="text-muted">
      {{ completadas }} / {{ total }} tareas
    </small>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  paquetes: { type: Array, default: () => [] },
  llantas: { type: Array, default: () => [] },
  adicionales: { type: Array, default: () => [] }
})

/**
 * 🔒 Normaliza TODO antes de usarlo
 */
const todas = computed(() => {
  return [
    ...(Array.isArray(props.paquetes) ? props.paquetes : []),
    ...(Array.isArray(props.llantas) ? props.llantas : []),
    ...(Array.isArray(props.adicionales) ? props.adicionales : [])
  ].filter(i => i && typeof i === 'object')
})

const total = computed(() => todas.value.length)

const completadas = computed(() => {
  return todas.value.reduce((acc, t) => {
    if (t.completada === true) acc++
    return acc
  }, 0)
})

const porcentaje = computed(() => {
  if (total.value === 0) return 0
  return Math.round((completadas.value / total.value) * 100)
})
</script>

<style scoped>
.progress-bar {
  transition: width 0.3s ease;
}
</style>
