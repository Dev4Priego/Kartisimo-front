<template>
  <div class="card mb-4 shadow-sm">
    <div class="card-header bg-light">
      <i class="bi bi-record-circle-fill me-2"></i>Llantas
    </div>

    <div class="card-body">
      <div v-if="llantas.length === 0" class="text-muted">
        No hay tareas de llantas
      </div>

      <div class="row g-3">
        <div
          v-for="(llanta, index) in llantas"
          :key="index"
          class="col-lg-6"
        >
          <LlantaCard
            :llanta="llanta"
            @tareaActualizada="emitirCambio"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LlantaCard from './LlantaCard.vue'

const props = defineProps({
  llantas: { type: Array, required: true }
})

const emit = defineEmits(['tareaActualizada'])

const emitirCambio = () => {
  emit('tareaActualizada')
}
</script>
