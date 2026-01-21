<template>
  <div class="card mb-4 shadow-sm rounded-4">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Progreso de la orden</strong>
        <small class="text-muted">
          {{ completadas }} de {{ total }} tareas completadas
        </small>
      </div>

      <div class="progress" style="height: 10px;">
        <div
          class="progress-bar bg-primary"
          role="progressbar"
          :style="{ width: porcentaje + '%' }"
        ></div>
      </div>

      <small class="text-muted mt-2 d-block">
        {{ porcentaje }}%
      </small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  paquetes: { type: Array, default: () => [] },
  llantas: { type: Array, default: () => [] },
  adicionales: { type: Array, default: () => [] }
})


const todasLasTareas = computed(() => {
  const tareasPaquetes = props.paquetes.flatMap(p => p.tareas)
  const tareasLlantas = props.llantas.flatMap(l => l.tareas)
  const tareasAdicionales = props.adicionales

  return [
    ...tareasPaquetes,
    ...tareasLlantas,
    ...tareasAdicionales
  ]
})


const total = computed(() => todasLasTareas.value.length)

const completadas = computed(() =>
  todasLasTareas.value.filter(t => t.completada).length
)


const porcentaje = computed(() => {
  if (total.value === 0) return 0
  return Math.round((completadas.value / total.value) * 100)
})

</script>
