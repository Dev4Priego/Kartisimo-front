<template>
  <div class="container py-3" v-if="ordenLista">

    <OrdenTrabajoProgress
      :paquetes="orden.paquetes"
      :llantas="orden.llantas"
      :adicionales="orden.adicionales"
    />

    <LlantasSection
      :llantas="orden.llantas"
      @tareaActualizada="refrescarOrden"
    />

    <PaquetesSection
      :paquetes="orden.paquetes"
      @tareaActualizada="refrescarOrden"
    />

    <AdicionalesSection
      :adicionales="orden.adicionales"
      @tareaActualizada="refrescarOrden"
    />

  </div>
</template>
<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'

import OrdenTrabajoProgress from '@/components/OrdenTrabajo/EditarOrdenTrabajo/OrdenTrabajoProgress.vue'
import LlantasSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Llantas/LlantasSection.vue'
import PaquetesSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Paquete/PaquetesSection.vue'
import AdicionalesSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Adicionales/AdicionalesSection.vue'

const { proxy } = getCurrentInstance()
const route = useRoute()

const orden = ref(null)

/**
 * 🔒 No renderizar nada hasta que TODO esté listo
 */
const ordenLista = computed(() => {
  if (!orden.value) return false

  return (
    Array.isArray(orden.value.paquetes) &&
    Array.isArray(orden.value.llantas) &&
    Array.isArray(orden.value.adicionales)
  )
})

const normalizar = (arr) =>
  Array.isArray(arr)
    ? arr.filter(i => i && typeof i === 'object')
    : []

const cargarOrden = async () => {
  try {
    const id = route.params.id
    console.log(' Cargando OT:', id)

    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajoById?id=${id}`
    )

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    console.log(' RESPUESTA BACKEND:', json)

    orden.value = {
      ...json,
      paquetes: normalizar(json.paquetes),
      llantas: normalizar(json.llantas),
      adicionales: normalizar(json.adicionales)
    }

  } catch (err) {
    console.error(' Error cargando OT:', err)
    orden.value = null
  }
}

const refrescarOrden = () => {
  cargarOrden()
}

onMounted(cargarOrden)
</script>
