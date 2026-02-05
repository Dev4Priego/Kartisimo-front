<template>
  <div class="container py-3" v-if="orden">

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
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'

import OrdenTrabajoProgress from '@/components/OrdenTrabajo/EditarOrdenTrabajo/OrdenTrabajoProgress.vue'
import LlantasSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Llantas/LlantasSection.vue'
import PaquetesSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Paquete/PaquetesSection.vue'
import AdicionalesSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Adicionales/AdicionalesSection.vue'

const { proxy } = getCurrentInstance()
const route = useRoute()

/**
 * 🔒 Estado inicial seguro
 */
const orden = ref({
  llantas: [],
  paquetes: [],
  adicionales: []
})

const cargarOrden = async () => {
  try {
    const id = route.params.id
    console.log('📌 Cargando OT:', id)

    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajoById?id=${id}`
    )

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    console.log(' RESPUESTA BACKEND:', json)

    /**
     * 🔒 Normalización total
     */
    orden.value = {
      ...json,
      llantas: Array.isArray(json.llantas) ? json.llantas : [],
      paquetes: Array.isArray(json.paquetes) ? json.paquetes : [],
      adicionales: Array.isArray(json.adicionales) ? json.adicionales : []
    }

  } catch (err) {
    console.error('❌ Error cargando OT:', err)

    // fallback seguro
    orden.value = {
      llantas: [],
      paquetes: [],
      adicionales: []
    }
  }
}

const refrescarOrden = () => {
  console.log('🔄 Refrescando orden...')
  cargarOrden()
}

onMounted(cargarOrden)
</script>
